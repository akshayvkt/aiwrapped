import JSZip from 'jszip';
import { ParseError, parseClaudeConversations } from './parseClaudeExport';
import { normalizeChatGPTConversations, detectProviderFromJson } from './parseChatGPTExport';
import type { AiProvider, AiSession } from './types';

type ParseResult = {
  provider: AiProvider;
  sessions: AiSession[];
};

export async function parseExport(
  file: File,
  providerOverride?: AiProvider
): Promise<ParseResult> {
  const zip = await JSZip.loadAsync(file);
  const conversationsFile = findConversationsFile(zip);

  if (!conversationsFile) {
    throw new ParseError(
      'Could not find conversations.json in the ZIP file. Please upload a valid export.'
    );
  }

  const conversationsText = await conversationsFile.async('text');
  const raw = JSON.parse(conversationsText);

  const provider =
    providerOverride ??
    detectProviderFromJson(raw) ??
    inferProviderFromStructure(conversationsFile.name);

  if (!provider) {
    throw new ParseError(
      'Could not determine whether this export came from Claude or ChatGPT. Please try selecting a provider manually.'
    );
  }

  const sessions =
    provider === 'claude'
      ? parseClaudeConversations(raw)
      : normalizeChatGPTConversations(raw);

  return { provider, sessions };
}

export async function detectProviderFromFile(file: File): Promise<AiProvider | null> {
  try {
    const zip = await JSZip.loadAsync(file);
    const conversationsFile = findConversationsFile(zip);
    if (!conversationsFile) {
      return null;
    }
    const text = await conversationsFile.async('text');
    const raw = JSON.parse(text);
    return detectProviderFromJson(raw) ?? inferProviderFromStructure(conversationsFile.name);
  } catch (error) {
    console.warn('Failed to detect provider from file:', error);
    return null;
  }
}

function findConversationsFile(zip: JSZip): JSZip.JSZipObject | null {
  const direct = zip.file('conversations.json');
  if (direct) return direct;

  const fallbackPath = Object.keys(zip.files).find(
    path => path.endsWith('conversations.json') && !path.includes('__MACOSX')
  );

  return fallbackPath ? zip.file(fallbackPath) ?? null : null;
}

function inferProviderFromStructure(path: string): AiProvider | null {
  if (!path) return null;
  const lower = path.toLowerCase();
  if (lower.includes('claude')) return 'claude';
  if (lower.includes('chatgpt') || lower.includes('openai')) return 'chatgpt';
  return null;
}
