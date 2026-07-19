import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ArtistsRepository } from '@/repositories/artists.repository';
import { SongsRepository } from '@/repositories/songs.repository';
import { PlayAllButton } from '@/components/library/play-all-button';
import { StartRadioButton } from '@/components/library/start-radio-button';
import { TrackRow } from '@/components/library/track-row';

export default async function ArtistPage({ params }: { params: { slug: string } }) {
  const db = createServerSupabaseClient();
  const artistsRepo = new ArtistsRepository(db);
  const songsRepo = new SongsRepository(db);

  const artist = await artistsRepo.findBySlug(params.slug);
  if (!artist) notFound();

  const [albums, songs] = await Promise.all([
    artistsRepo.findAlbumsByArtist(artist.id),
    songsRepo.findByArtist(artist.id),
  ]);

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="h-40 w-40 shrink-0 overflow-hidden rounded-full bg-ink-700 shadow-2xl">
          {artist.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artist.photoUrl} alt={artist.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-parchment-500">Artista</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-parchment-50 sm:text-5xl">
            {artist.name}
          </h1>
          <p className="mt-2 text-sm text-parchment-300">
            {[artist.country, artist.formedYear].filter(Boolean).join(' · ')}
            {songs.length > 0 ? ` · ${songs.length} músicas` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center">
        <PlayAllButton songs={songs} />
        <StartRadioButton artistId={artist.id} />
      </div>

      {albums.length > 0 && (
        <>
          <div className="sprocket-divider my-8" />
          <h2 className="mb-4 font-display text-xl font-semibold text-parchment-50">Álbuns</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.slug}`}
                className="w-40 shrink-0 rounded-lg p-2 transition-colors hover:bg-white/5"
              >
                <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-ink-700">
                  {album.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <p className="truncate text-sm font-medium text-parchment-50">{album.title}</p>
                <p className="truncate text-xs text-parchment-500">{album.releaseYear ?? ''}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="sprocket-divider my-8" />

      <h2 className="mb-4 font-display text-xl font-semibold text-parchment-50">Todas as músicas</h2>
      <div className="flex flex-col gap-1">
        {songs.length === 0 ? (
          <p className="text-sm text-parchment-500">Nenhuma música importada para este artista ainda.</p>
        ) : (
          songs.map((song) => <TrackRow key={song.id} song={song} queue={songs} />)
        )}
      </div>

      {artist.biography && (
        <>
          <div className="sprocket-divider my-8" />
          <h2 className="mb-3 font-display text-xl font-semibold text-parchment-50">Sobre</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-parchment-300">{artist.biography}</p>
        </>
      )}
    </div>
  );
}
