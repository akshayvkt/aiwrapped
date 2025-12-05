import JSZip from 'jszip';
import type { AiSession } from './types';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Parse a Claude export ZIP file and extract conversations
 * @param file - The ZIP file from the file input
 * @returns Array of Claude sessions
 */
export async function parseClaudeExport(file: File): Promise<AiSession[]> {
  try {
    // Load and unzip the file
    const zip = await JSZip.loadAsync(file);

    // Find conversations.json (might be in root or a subfolder)
    let conversationsFile = zip.file('conversations.json');

    if (!conversationsFile) {
      // Try looking in a subfolder (e.g., claude_data_*/conversations.json)
      const allFiles = Object.keys(zip.files);
      const conversationsPath = allFiles.find(path =>
        path.endsWith('conversations.json') && !path.startsWith('__MACOSX')
      );

      if (!conversationsPath) {
        throw new ParseError(
          'Could not find conversations.json in the ZIP file. ' +
          'Please make sure you uploaded a valid Claude export.'
        );
      }

      conversationsFile = zip.file(conversationsPath);
    }

    if (!conversationsFile) {
      throw new ParseError('Could not access conversations.json');
    }

    // Read and parse the JSON
    const conversationsText = await conversationsFile.async('text');
    const conversations = parseClaudeConversations(JSON.parse(conversationsText));
    console.log(`✅ Parsed ${conversations.length} conversations`);
    return conversations;

  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes('Unsupported compression method')) {
        throw new ParseError(
          'The ZIP file uses an unsupported compression method. ' +
          'Please try re-downloading your Claude export.'
        );
      }

      if (error.message.includes('JSON')) {
        throw new ParseError(
          'Failed to parse conversations.json. The file may be corrupted.'
        );
      }
    }

    throw new ParseError(
      `Unexpected error while parsing: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function parseClaudeConversations(raw: unknown): AiSession[] {
  if (!Array.isArray(raw)) {
    throw new ParseError('Invalid conversations.json format: expected an array');
  }

  if (raw.length === 0) {
    throw new ParseError('No conversations found in the export');
  }

  const firstConvo = raw[0] as Record<string, unknown>;
  if (!firstConvo || !firstConvo.uuid || !firstConvo.created_at || !firstConvo.chat_messages) {
    throw new ParseError('Invalid conversation structure in conversations.json');
  }

  return raw as AiSession[];
}
