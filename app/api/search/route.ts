import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ArtistsRepository } from '@/repositories/artists.repository';
import { AlbumsRepository } from '@/repositories/albums.repository';
import { SongsRepository } from '@/repositories/songs.repository';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ artists: [], albums: [], songs: [] });
  }

  const db = createServerSupabaseClient();
  const artistsRepo = new ArtistsRepository(db);
  const albumsRepo = new AlbumsRepository(db);
  const songsRepo = new SongsRepository(db);

  const [artists, albums, songs] = await Promise.all([
    artistsRepo.search(query, 8),
    albumsRepo.search(query, 8),
    songsRepo.search(query, 15),
  ]);

  return NextResponse.json({ artists, albums, songs });
}
