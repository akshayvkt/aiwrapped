import { NextResponse } from 'next/server';
import type { PersonalityBlurb, WrappedStats } from '@/lib/types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { persona } = await request.json() as { persona: PersonalityBlurb };

    if (!persona) {
      return NextResponse.json(
        { error: 'Missing persona data' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // First, fetch the existing wrapped_data
    const fetchResponse = await fetch(`${supabaseUrl}/rest/v1/shared_wraps?id=eq.${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!fetchResponse.ok) {
      console.error('Failed to fetch existing wrap:', fetchResponse.status);
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    const existingData = await fetchResponse.json();

    if (!existingData || existingData.length === 0) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    const existingWrap = existingData[0].wrapped_data as WrappedStats;

    // Merge persona into existing wrapped_data
    const updatedWrap: WrappedStats = {
      ...existingWrap,
      persona,
    };

    // Update the Supabase row with merged data (using service role key to bypass RLS)
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/shared_wraps?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        wrapped_data: updatedWrap,
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update Supabase:', updateResponse.status, errorText);
      return NextResponse.json(
        { error: 'Failed to update share' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      shareId: id,
    });

  } catch (error) {
    console.error('Error in share PATCH API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
