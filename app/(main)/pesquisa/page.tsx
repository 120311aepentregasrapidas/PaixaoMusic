'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { useInstantSearch } from '@/features/search/use-instant-search';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration } from '@/utils/format';

export default function PesquisaPage() {
  const [query, setQuery] = useState('');
  const { results, isLoading } = useInstantSearch(query);
  const playSong = usePlayerStore((s) => s.playSong);

  const hasQuery = query.trim().length >= 2;
  const hasResults = results.artists.length > 0 || results.albums.length > 0 || results.songs.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-parchment-500" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artistas, álbuns ou músicas..."
          className="w-full rounded-full border border-white/10 bg-ink-800/60 py-3.5 pl-12 pr-4 text-parchment-50 placeholder:text-parchment-500 focus:border-paixao-500/50"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-parchment-500" />
        )}
      </div>

      {!hasQuery && (
        <p className="mt-10 text-center text-sm text-parchment-500">
          Digite ao menos 2 letras para começar a buscar.
        </p>
      )}

      {hasQuery && !isLoading && !hasResults && (
        <p className="mt-10 text-center text-sm text-parchment-500">
          Nenhum resultado para &ldquo;{query}&rdquo;.
        </p>
      )}

      {results.artists.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-parchment-50">Artistas</h2>
          <div className="flex flex-wrap gap-3">
            {results.artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artista/${artist.slug}`}
                className="flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-sm text-parchment-100 hover:bg-white/5"
              >
                {artist.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.albums.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-parchment-50">Álbuns</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {results.albums.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.slug}`}
                className="w-36 shrink-0 rounded-lg p-2 hover:bg-white/5"
              >
                <div className="mb-2 aspect-square overflow-hidden rounded-lg bg-ink-700">
                  {album.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={album.coverUrl} alt={album.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <p className="truncate text-sm font-medium text-parchment-50">{album.title}</p>
                <p className="truncate text-xs text-parchment-500">{album.artist?.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.songs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-parchment-50">Músicas</h2>
          <div className="flex flex-col gap-1">
            {results.songs.map((song) => (
              <button
                key={song.id}
                onClick={() => playSong(song, results.songs)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/5"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-ink-700">
                  {song.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-parchment-50">{song.title}</p>
                  <p className="truncate text-xs text-parchment-500">{song.artist?.name}</p>
                </div>
                <span className="font-mono text-xs text-parchment-500">
                  {formatDuration(song.video?.durationSeconds)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
