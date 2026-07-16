import Link from 'next/link';
import { UploadCloud, Play, Sparkles } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SongsRepository } from '@/repositories/songs.repository';
import type { Song } from '@/types/database';
import { Button } from '@/components/ui/button';

async function getHomeData() {
  try {
    const db = createServerSupabaseClient();
    const repo = new SongsRepository(db);
    const [mostPlayed] = await Promise.all([repo.mostPlayed(12)]);
    return { mostPlayed, hasLibrary: mostPlayed.length > 0 };
  } catch {
    // Sem sessão ainda / biblioteca vazia — trata como estado inicial do produto.
    return { mostPlayed: [] as Song[], hasLibrary: false };
  }
}

export default async function HomePage() {
  const { mostPlayed, hasLibrary } = await getHomeData();

  if (!hasLibrary) {
    return <EmptyLibraryHero />;
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-semibold text-parchment-50">
          Bem-vindo de volta
        </h1>
        <p className="mt-1 text-sm text-parchment-500">
          Continue de onde parou, ou explore sua coleção.
        </p>
      </section>

      <div className="sprocket-divider my-6" />

      <Rail title="Mais ouvidas" songs={mostPlayed} />
    </div>
  );
}

function Rail({ title, songs }: { title: string; songs: Song[] }) {
  if (songs.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="mb-4 font-display text-xl font-semibold text-parchment-50">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
}

function SongCard({ song }: { song: Song }) {
  return (
    <Link
      href={`/album/${song.album?.slug ?? ''}`}
      className="group w-40 shrink-0 rounded-lg p-2 transition-colors hover:bg-white/5"
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-ink-700">
        {song.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/40 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paixao-500 text-white">
            <Play className="h-4 w-4 pl-0.5" />
          </div>
        </div>
      </div>
      <p className="truncate text-sm font-medium text-parchment-50">{song.title}</p>
      <p className="truncate text-xs text-parchment-500">{song.artist?.name}</p>
    </Link>
  );
}

/**
 * Estado inicial do produto: biblioteca ainda vazia (nenhum vídeo importado).
 * É um convite direto à ação principal do sistema — a importação em massa —
 * em vez de uma tela genérica de "nada encontrado".
 */
function EmptyLibraryHero() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-paixao-500/10 text-paixao-500">
        <Sparkles className="h-7 w-7" />
      </div>
      <h1 className="font-display text-3xl font-semibold text-parchment-50">
        Sua videoteca está pronta para começar
      </h1>
      <p className="mt-3 max-w-md text-sm text-parchment-500">
        Importe a pasta com seus videoclipes e o Paixão Music organiza tudo — artista, álbum,
        gênero, capa e metadados — automaticamente.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/admin/importar">
          <UploadCloud className="h-4 w-4" />
          Importar minha coleção
        </Link>
      </Button>
    </div>
  );
}
