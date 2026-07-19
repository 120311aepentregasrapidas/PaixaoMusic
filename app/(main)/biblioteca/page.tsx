import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ArtistsRepository } from '@/repositories/artists.repository';
import { AlbumsRepository } from '@/repositories/albums.repository';
import { GenresRepository } from '@/repositories/genres.repository';

const PAGE_SIZE = 48;

export default async function BibliotecaPage({
  searchParams,
}: {
  searchParams: { artistas?: string; albuns?: string };
}) {
  const artistPage = Math.max(1, parseInt(searchParams.artistas ?? '1', 10) || 1);
  const albumPage = Math.max(1, parseInt(searchParams.albuns ?? '1', 10) || 1);

  const db = createServerSupabaseClient();
  const artistsRepo = new ArtistsRepository(db);
  const albumsRepo = new AlbumsRepository(db);
  const genresRepo = new GenresRepository(db);

  const [artistsResult, albumsResult, genres] = await Promise.all([
    artistsRepo.findPage(artistPage, PAGE_SIZE),
    albumsRepo.findPage(albumPage, PAGE_SIZE),
    genresRepo.findAll(),
  ]);

  const { artists, estimatedTotal: totalArtists } = artistsResult;
  const { albums, estimatedTotal: totalAlbums } = albumsResult;

  const isEmpty = artists.length === 0 && albums.length === 0 && artistPage === 1 && albumPage === 1;

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="font-display text-2xl font-semibold text-parchment-50">Biblioteca</h1>
      <p className="mt-1 text-sm text-parchment-500">
        Tudo que já foi importado para a sua videoteca.
      </p>

      {isEmpty && (
        <p className="mt-10 text-sm text-parchment-500">
          Sua biblioteca ainda está vazia.{' '}
          <Link href="/admin/importar" className="text-paixao-500 hover:underline">
            Importe sua coleção
          </Link>{' '}
          para começar.
        </p>
      )}

      {genres.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-parchment-50">Gêneros</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <span
                key={genre.id}
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-parchment-300"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {artists.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-parchment-50">
              Artistas (~{totalArtists})
            </h2>
            <Pagination
              page={artistPage}
              pageSize={PAGE_SIZE}
              estimatedTotal={totalArtists}
              paramName="artistas"
              preserveParams={{ albuns: searchParams.albuns }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artista/${artist.slug}`}
                className="flex flex-col items-center gap-2 rounded-lg p-3 text-center hover:bg-white/5"
              >
                <div className="aspect-square w-full overflow-hidden rounded-full bg-ink-700">
                  {artist.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artist.photoUrl}
                      alt={artist.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <p className="truncate text-sm text-parchment-50">{artist.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-parchment-50">
              Álbuns (~{totalAlbums})
            </h2>
            <Pagination
              page={albumPage}
              pageSize={PAGE_SIZE}
              estimatedTotal={totalAlbums}
              paramName="albuns"
              preserveParams={{ artistas: searchParams.artistas }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.slug}`}
                className="rounded-lg p-2 hover:bg-white/5"
              >
                <div className="mb-2 aspect-square overflow-hidden rounded-lg bg-ink-700">
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
                <p className="truncate text-xs text-parchment-500">{album.artist?.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Paginação simples via query string (?artistas=2, ?albuns=3) — funciona sem
 * JavaScript no cliente, cada página é uma navegação normal (RSC), então o
 * custo real da paginação continua só no banco (via `.range()`).
 */
function Pagination({
  page,
  pageSize,
  estimatedTotal,
  paramName,
  preserveParams,
}: {
  page: number;
  pageSize: number;
  estimatedTotal: number;
  paramName: string;
  preserveParams: Record<string, string | undefined>;
}) {
  const hasNext = page * pageSize < estimatedTotal;
  const hasPrev = page > 1;

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(preserveParams)) {
      if (value) params.set(key, value);
    }
    params.set(paramName, String(targetPage));
    return `/biblioteca?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-1">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={!hasPrev}
        className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 ${
          hasPrev ? 'text-parchment-100 hover:bg-white/5' : 'pointer-events-none text-parchment-500/30'
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="px-2 font-mono text-xs text-parchment-500">{page}</span>
      <Link
        href={buildHref(page + 1)}
        aria-disabled={!hasNext}
        className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 ${
          hasNext ? 'text-parchment-100 hover:bg-white/5' : 'pointer-events-none text-parchment-500/30'
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
