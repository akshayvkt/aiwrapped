import JSZip from 'jszip';
import type { AiSession, AiMessage, AiAttachment, AiProvider } from './types';
import { ParseError } from './parseClaudeExport';

type ChatGPTConversation = {
  conversation_id?: string;
  id?: string;
  title?: string;
  create_time?: number;
  update_time?: number;
  mapping?: Record<string, ChatGPTNode>;
  current_node?: string;
};

type ChatGPTNode = {
  id?: string;
  parent?: string;
  message?: ChatGPTMessage;
};

type ChatGPTContentPart =
  | string
  | {
      text?: string;
      asset_pointer?: string;
      content_type?: string;
      [key: string]: unknown;
    };

type ChatGPTMessage = {
  id?: string;
  author?: { role?: string };
  recipient?: string;
  create_time?: number;
  update_time?: number;
  status?: string;
  content?: ChatGPTContent | ChatGPTContentPart[] | null;
  metadata?: {
    attachments?: Array<{ name?: string }>;
    is_error?: boolean;
    rebase_system_message?: boolean;
  };
};

type ChatGPTContent = {
  content_type?: string;
  parts?: ChatGPTContentPart[];
  asset_pointer?: string;
  text?: string;
  [key: string]: unknown;
};

type FilteredMessage = {
  index: number;
  role: 'user' | 'assistant';
  node: ChatGPTNode;
  artifacts: AiAttachment[];
  synthetic: boolean;
};

export async function parseChatGPTExport(file: File): Promise<AiSession[]> {
  try {
    const zip = await JSZip.loadAsync(file);
    const conversationsFile = findConversationsFile(zip);

    if (!conversationsFile) {
      throw new ParseError(
        'Could not find conversations.json in the ZIP file. ' +
          'Please make sure you uploaded a valid ChatGPT export.'
      );
    }

    const conversationsText = await conversationsFile.async('text');
    return normalizeChatGPTConversations(JSON.parse(conversationsText));
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }

    throw new ParseError(
      `Unexpected error while parsing ChatGPT export: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export function normalizeChatGPTConversations(raw: unknown): AiSession[] {
  if (!Array.isArray(raw)) {
    throw new ParseError('Invalid conversations.json format: expected an array');
  }

  const normalized = (raw as ChatGPTConversation[])
    .map(normalizeChatGPTConversationSafely)
    .filter((session): session is AiSession => Boolean(session));

  if (normalized.length === 0) {
    throw new ParseError('No conversations could be normalised from the ChatGPT export.');
  }

  return normalized;
}

function normalizeChatGPTConversationSafely(
  conversation: ChatGPTConversation | null | undefined
): AiSession | null {
  if (!conversation) {
    return null;
  }

  try {
    return normalizeChatGPTConversation(conversation);
  } catch (error) {
    console.warn('Skipping malformed ChatGPT conversation:', error);
    return null;
  }
}

function normalizeChatGPTConversation(conversation: ChatGPTConversation): AiSession {
  const path = walkConversationPath(conversation);
  const filtered = filterVisibleMessages(path);

  const chat_messages: AiMessage[] = [];
  for (const entry of filtered) {
    const message = entry.node.message ?? {};
    const createdAt =
      epochToIso(message.create_time) ??
      epochToIso(message.update_time) ??
      epochToIso(conversation.create_time) ??
      new Date(0).toISOString();

    const text = extractText(message.content);
    const attachments = entry.artifacts.length > 0 ? entry.artifacts : undefined;

    // Ignore empty entries with no text and no attachments
    if (!text && !attachments) {
      continue;
    }

    const normalized: AiMessage = {
      uuid: message.id ?? randomId(),
      sender: entry.role === 'user' ? 'human' : 'assistant',
      text,
      created_at: createdAt,
    };

    if (attachments) {
      normalized.attachments = attachments;
    }

    chat_messages.push(normalized);
  }

  return {
    uuid: conversation.conversation_id ?? conversation.id ?? randomId(),
    name: conversation.title || '(unnamed)',
    summary: '',
    created_at: epochToIso(conversation.create_time) ?? new Date(0).toISOString(),
    updated_at: epochToIso(conversation.update_time) ?? epochToIso(conversation.create_time) ?? new Date(0).toISOString(),
    chat_messages,
    account: { uuid: 'chatgpt' },
  };
}

function walkConversationPath(conversation: ChatGPTConversation): ChatGPTNode[] {
  const mappingEntries = Object.entries(conversation.mapping ?? {}) as Array<[string, ChatGPTNode]>;
  const mapping = new Map<string, ChatGPTNode>(mappingEntries);
  const currentId = conversation.current_node;

  const nodes = mappingEntries
    .map(([, node]) => node)
    .filter(node => node?.message);

  if (!currentId || !mapping.has(currentId)) {
    return nodes.sort(
      (a, b) =>
        (a.message?.create_time ?? a.message?.update_time ?? 0) -
        (b.message?.create_time ?? b.message?.update_time ?? 0)
    );
  }

  const path: ChatGPTNode[] = [];
  const visited = new Set<string>();
  let cursor: string | undefined = currentId;

  while (cursor) {
    if (visited.has(cursor)) {
      break;
    }
    const node = mapping.get(cursor);
    if (!node) break;
    path.push(node);
    visited.add(cursor);
    cursor = node.parent;
  }

  return path.reverse();
}

function filterVisibleMessages(path: ChatGPTNode[]): FilteredMessage[] {
  const messages: FilteredMessage[] = [];
  const pendingBatches: Array<{ artifacts: AiAttachment[]; timestamp: number; order: number }> = [];
  let lastTimestamp: number | null = null;

  const extractTimestamp = (msg: ChatGPTMessage | undefined) => {
    if (!msg) return null;
    return msg.create_time ?? msg.update_time ?? null;
  };

  path.forEach((node, index) => {
    const msg = node.message;
    if (!msg) return;

    const role = msg.author?.role;
    const recipient = msg.recipient ?? 'all';
    const messageTimestamp = extractTimestamp(msg);

    if (messageTimestamp !== null) {
      lastTimestamp = messageTimestamp;
    }

    if (role === 'user') {
      messages.push({
        index,
        role: 'user',
        node,
        artifacts: [],
        synthetic: false,
      });
      return;
    }

    if (role === 'assistant') {
      if (recipient !== 'all') {
        return; // tool-directed step
      }

      const attached = collectPendingAttachments(pendingBatches);
      messages.push({
        index,
        role: 'assistant',
        node,
        artifacts: attached,
        synthetic: false,
      });
      return;
    }

    if (role === 'tool') {
      const artifacts = extractToolArtifacts(node);
      if (artifacts.length === 0) {
        return;
      }

      const timestamp = messageTimestamp ?? lastTimestamp ?? 0;
      pendingBatches.push({
        artifacts,
        timestamp,
        order: index,
      });
    }
  });

  // Synthesize assistant messages for any leftover tool artifacts
  pendingBatches.forEach(batch => {
    const syntheticId = randomId();
    const syntheticNode: ChatGPTNode = {
      id: syntheticId,
      message: {
        id: syntheticId,
        author: { role: 'assistant' },
        recipient: 'all',
        create_time: batch.timestamp,
        content: { content_type: 'text', parts: [''] },
      },
    };

    messages.push({
      index: batch.order,
      role: 'assistant',
      node: syntheticNode,
      artifacts: batch.artifacts,
      synthetic: true,
    });
  });

  return messages.sort((a, b) => {
    const aTimestamp =
      a.node.message?.create_time ?? a.node.message?.update_time ?? Number.POSITIVE_INFINITY;
    const bTimestamp =
      b.node.message?.create_time ?? b.node.message?.update_time ?? Number.POSITIVE_INFINITY;
    if (aTimestamp === bTimestamp) {
      return a.index - b.index;
    }
    return aTimestamp - bTimestamp;
  });
}

function collectPendingAttachments(
  batches: Array<{ artifacts: AiAttachment[]; timestamp: number; order: number }>
): AiAttachment[] {
  if (batches.length === 0) {
    return [];
  }

  const collected = batches.flatMap(batch => batch.artifacts);
  batches.splice(0, batches.length);
  return collected;
}

function normalizeContentToParts(content: ChatGPTMessage['content']): ChatGPTContentPart[] {
  if (!content) return [];

  if (Array.isArray(content)) {
    return content.flatMap(part => {
      if (part && typeof part === 'object' && Array.isArray((part as ChatGPTContent).parts)) {
        return ((part as ChatGPTContent).parts ?? []).filter(
          (nested): nested is ChatGPTContentPart => Boolean(nested)
        );
      }
      return part ? [part as ChatGPTContentPart] : [];
    });
  }

  if (typeof content === 'object') {
    const obj = content as ChatGPTContent;
    if (Array.isArray(obj.parts)) {
      return obj.parts.filter((part): part is ChatGPTContentPart => Boolean(part));
    }
    return [obj as ChatGPTContentPart];
  }

  if (typeof content === 'string') {
    return [content];
  }

  return [];
}

function extractText(content: ChatGPTMessage['content']): string {
  const parts = normalizeContentToParts(content);

  const strings = parts
    .map(part => {
      if (typeof part === 'string') {
        return part;
      }
      const textValue = part?.text;
      return typeof textValue === 'string' ? textValue : null;
    })
    .filter((value): value is string => Boolean(value && value.trim()));

  return strings.map(str => str.trim()).join('\n');
}

function extractToolArtifacts(node: ChatGPTNode): AiAttachment[] {
  const message = node.message;
  if (!message) return [];

  const parts = normalizeContentToParts(message.content);

  const imageParts = parts.filter(
    part =>
      part &&
      typeof part === 'object' &&
      'asset_pointer' in part &&
      typeof (part as { asset_pointer?: unknown }).asset_pointer === 'string'
  ) as Array<{ asset_pointer: string }>;

  if (imageParts.length === 0) {
    return [];
  }

  return [
    {
      type: 'image',
      count: imageParts.length,
      asset_pointers: imageParts
        .map(part => part.asset_pointer)
        .filter((value): value is string => Boolean(value)),
    },
  ];
}

function epochToIso(epoch: number | undefined): string | undefined {
  if (!epoch || Number.isNaN(epoch)) {
    return undefined;
  }

  const date = new Date(epoch * 1000);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function randomId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `synthetic-${Math.random().toString(36).slice(2, 10)}`;
}

function findConversationsFile(zip: JSZip): JSZip.JSZipObject | null {
  const direct = zip.file('conversations.json');
  if (direct) {
    return direct;
  }

  const fallbackPath = Object.keys(zip.files).find(
    path => path.endsWith('conversations.json') && !path.includes('__MACOSX')
  );

  return fallbackPath ? zip.file(fallbackPath) ?? null : null;
}

export function detectProviderFromJson(raw: unknown): AiProvider | null {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  const sample = raw[0] as Record<string, unknown>;
  if (sample?.chat_messages) {
    return 'claude';
  }
  if (sample?.mapping) {
    return 'chatgpt';
  }
  return null;
}
