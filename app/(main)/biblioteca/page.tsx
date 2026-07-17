import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ArtistsRepository } from '@/repositories/artists.repository';
import { AlbumsRepository } from '@/repositories/albums.repository';
import { GenresRepository } from '@/repositories/genres.repository';

export default async function BibliotecaPage() {
  const db = createServerSupabaseClient();
  const artistsRepo = new ArtistsRepository(db);
  const albumsRepo = new AlbumsRepository(db);
  const genresRepo = new GenresRepository(db);

  const [artists, albums, genres] = await Promise.all([
    artistsRepo.findAll(60),
    albumsRepo.findAll(60),
    genresRepo.findAll(),
  ]);

  const isEmpty = artists.length === 0 && albums.length === 0;

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
          <h2 className="mb-4 font-display text-lg font-semibold text-parchment-50">
            Artistas ({artists.length})
          </h2>
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
          <h2 className="mb-4 font-display text-lg font-semibold text-parchment-50">
            Álbuns ({albums.length})
          </h2>
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
