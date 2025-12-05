import type { PersonalityBlurb, WrappedStats } from './types';

/**
 * Generate a random 8-character alphanumeric ID for share links
 * 62^8 = 218 trillion possible combinations
 */
export function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Create a shareable wrap by saving to Supabase
 * Returns the share ID if successful, null otherwise
 */
export async function createShareableWrap(stats: WrappedStats): Promise<string | null> {
  try {
    const response = await fetch('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wrappedData: stats }),
    });

    if (!response.ok) {
      console.error('Failed to create shareable wrap:', response.status);
      return null;
    }

    const data = await response.json();
    return data.shareId || null;
  } catch (error) {
    console.error('Error creating shareable wrap:', error);
    return null;
  }
}

/**
 * Fetch a shared wrap by ID from Supabase
 * Returns the WrappedStats if found, null otherwise
 */
export async function getSharedWrap(shareId: string): Promise<WrappedStats | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return null;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/shared_wraps?id=eq.${shareId}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch shared wrap:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    // Include the shareId so the Share button works on shared pages
    return {
      ...data[0].wrapped_data,
      shareId: data[0].id,
    } as WrappedStats;
  } catch (error) {
    console.error('Error fetching shared wrap:', error);
    return null;
  }
}

/**
 * Update a shared wrap with persona data (Phase 2 of two-phase update)
 * Fire-and-forget - runs in background after persona generation completes
 */
export async function updateSharedWrapWithPersona(
  shareId: string,
  persona: PersonalityBlurb
): Promise<void> {
  try {
    const response = await fetch(`/api/share/${shareId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ persona }),
    });

    if (!response.ok) {
      console.error('Failed to update shared wrap with persona:', response.status);
      return;
    }

    console.log('✅ Shared wrap updated with persona:', shareId);
  } catch (error) {
    console.error('Error updating shared wrap with persona:', error);
  }
}
