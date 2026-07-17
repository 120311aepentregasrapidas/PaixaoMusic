import Link from 'next/link';
import { Music2, Mic2, Disc3 } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StatsRepository } from '@/repositories/stats.repository';
import { SongsRepository } from '@/repositories/songs.repository';
import { HoursPlayedCard } from '@/components/library/hours-played-card';

export default async function EstatisticasPage() {
  const db = createServerSupabaseClient();
  const statsRepo = new StatsRepository(db);
  const songsRepo = new SongsRepository(db);

  const [topArtists, topAlbums, topSongs, totalSongs, totalArtists] = await Promise.all([
    statsRepo.getTopArtists(10),
    statsRepo.getTopAlbums(10),
    songsRepo.mostPlayed(10),
    statsRepo.getTotalSongsCount(),
    statsRepo.getTotalArtistsCount(),
  ]);

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="font-display text-2xl font-semibold text-parchment-50">Estatísticas</h1>
      <p className="mt-1 text-sm text-parchment-500">Um retrato da sua biblioteca e do seu uso.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <HoursPlayedCard />
        <div className="surface-card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vinil-500/10 text-vinil-400">
            <Music2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-parchment-500">Músicas na biblioteca</p>
            <p className="font-display text-xl font-semibold text-parchment-50">{totalSongs}</p>
          </div>
        </div>
        <div className="surface-card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <Mic2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-parchment-500">Artistas na biblioteca</p>
            <p className="font-display text-xl font-semibold text-parchment-50">{totalArtists}</p>
          </div>
        </div>
      </div>

      <div className="sprocket-divider my-8" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-parchment-50">
            <Mic2 className="h-4 w-4 text-paixao-500" />
            Artistas mais ouvidos
          </h2>
          {topArtists.length === 0 ? (
            <p className="text-sm text-parchment-500">Ainda sem reproduções suficientes.</p>
          ) : (
            <ol className="flex flex-col gap-1">
              {topArtists.map((artist, index) => (
                <li
                  key={artist.artistId}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-parchment-100"
                >
                  <span className="w-5 font-mono text-xs text-parchment-500">{index + 1}</span>
                  <span className="flex-1 truncate">{artist.artistName}</span>
                  <span className="font-mono text-xs text-parchment-500">{artist.totalPlays}×</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-parchment-50">
            <Disc3 className="h-4 w-4 text-paixao-500" />
            Álbuns mais ouvidos
          </h2>
          {topAlbums.length === 0 ? (
            <p className="text-sm text-parchment-500">Ainda sem reproduções suficientes.</p>
          ) : (
            <ol className="flex flex-col gap-1">
              {topAlbums.map((album, index) => (
                <li
                  key={album.albumId}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-parchment-100"
                >
                  <span className="w-5 font-mono text-xs text-parchment-500">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {album.albumTitle}
                    <span className="text-parchment-500"> — {album.artistName}</span>
                  </span>
                  <span className="font-mono text-xs text-parchment-500">{album.totalPlays}×</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-parchment-50">
            <Music2 className="h-4 w-4 text-paixao-500" />
            Músicas mais ouvidas
          </h2>
          {topSongs.length === 0 ? (
            <p className="text-sm text-parchment-500">Ainda sem reproduções suficientes.</p>
          ) : (
            <ol className="flex flex-col gap-1">
              {topSongs.map((song, index) => (
                <li key={song.id}>
                  <Link
                    href={song.album ? `/album/${song.album.slug}` : '#'}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-parchment-100 hover:bg-white/5"
                  >
                    <span className="w-5 font-mono text-xs text-parchment-500">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {song.title}
                      <span className="text-parchment-500"> — {song.artist?.name}</span>
                    </span>
                    <span className="font-mono text-xs text-parchment-500">{song.playCount}×</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
