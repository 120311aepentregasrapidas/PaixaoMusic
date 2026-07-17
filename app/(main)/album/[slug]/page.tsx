import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AlbumsRepository } from '@/repositories/albums.repository';
import { SongsRepository } from '@/repositories/songs.repository';
import { PlayAllButton } from '@/components/library/play-all-button';
import { TrackRow } from '@/components/library/track-row';

export default async function AlbumPage({ params }: { params: { slug: string } }) {
  const db = createServerSupabaseClient();
  const albumsRepo = new AlbumsRepository(db);
  const songsRepo = new SongsRepository(db);

  const album = await albumsRepo.findBySlug(params.slug);
  if (!album) notFound();

  const songs = await songsRepo.findByAlbum(album.id);

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="aspect-square w-48 shrink-0 overflow-hidden rounded-xl bg-ink-700 shadow-2xl">
          {album.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={album.coverUrl} alt={album.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-parchment-500">Álbum</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-parchment-50 sm:text-4xl">
            {album.title}
          </h1>
          <p className="mt-2 text-sm text-parchment-300">
            {album.artist && (
              <Link href={`/artista/${album.artist.slug}`} className="hover:underline">
                {album.artist.name}
              </Link>
            )}
            {album.releaseYear ? ` · ${album.releaseYear}` : ''}
            {songs.length > 0 ? ` · ${songs.length} faixas` : ''}
          </p>
        </div>
      </div>

      <PlayAllButton songs={songs} />

      <div className="sprocket-divider my-8" />

      <div className="flex flex-col gap-1">
        {songs.length === 0 ? (
          <p className="text-sm text-parchment-500">Nenhuma música importada para este álbum ainda.</p>
        ) : (
          songs.map((song) => <TrackRow key={song.id} song={song} queue={songs} />)
        )}
      </div>
    </div>
  );
}
