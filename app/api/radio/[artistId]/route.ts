import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SongsRepository } from '@/repositories/songs.repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: { artistId: string } },
) {
  const db = createServerSupabaseClient();

  const { data, error } = await db.rpc('get_radio_queue', {
    p_artist_id: params.artistId,
    result_limit: 50,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // O RPC retorna uma coluna escalar (setof uuid) — normaliza para string[]
  // independentemente de vir como array de strings ou array de objetos.
  const ids: string[] = (data ?? []).map((row: unknown) =>
    typeof row === 'string' ? row : Object.values(row as Record<string, string>)[0],
  );

  const songsRepo = new SongsRepository(db);
  const songs = await songsRepo.findByIds(ids);

  return NextResponse.json({ songs });
}
