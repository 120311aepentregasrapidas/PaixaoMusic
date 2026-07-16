'use client';

import { useState } from 'react';
import { FolderInput, FileVideo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Painel de importação em massa.
 *
 * Fluxo (ver features/import para a lógica completa):
 *   1. Usuário seleciona uma pasta local (File System Access API / <input webkitdirectory>)
 *   2. O client varre recursivamente por arquivos .mp4
 *   3. Para cada arquivo: extrai metadados (music-metadata), sobe para o Storage
 *      Provider ativo, resolve/à cria artista+álbum+gênero, grava em `videos`+`songs`
 *   4. Progresso é reportado aqui em tempo real
 *
 * Esta versão é o esqueleto de UI; a orquestração real deve ficar em
 * features/import/use-import-pipeline.ts para manter esta página "burra".
 */
export default function ImportarPage() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-2xl font-semibold text-parchment-50">
        Importar coleção
      </h1>
      <p className="mt-2 text-sm text-parchment-500">
        Escolha a pasta raiz da sua videoteca (ex.: <code className="font-mono">Músicas/</code>).
        O sistema varre todas as subpastas, identifica cada MP4 e importa tudo automaticamente.
      </p>

      <label
        htmlFor="folder-input"
        className="mt-8 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-ink-800/40 px-6 py-14 text-center transition-colors hover:border-paixao-500/60 hover:bg-ink-800/60"
      >
        <FolderInput className="h-8 w-8 text-paixao-500" />
        <span className="font-medium text-parchment-50">
          {selectedFolder ?? 'Clique para escolher uma pasta'}
        </span>
        <span className="text-xs text-parchment-500">
          Suporta milhares de arquivos organizados em Artista/Álbum/Música.mp4
        </span>
        <input
          id="folder-input"
          type="file"
          className="hidden"
          // @ts-expect-error — atributo não padronizado, mas suportado por navegadores modernos
          webkitdirectory=""
          multiple
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              const first = files[0] as File & { webkitRelativePath?: string };
              setSelectedFolder(first.webkitRelativePath?.split('/')[0] ?? 'Pasta selecionada');
            }
          }}
        />
      </label>

      <div className="mt-6 flex items-center justify-between rounded-lg bg-ink-800/40 px-4 py-3 text-sm text-parchment-500">
        <span className="flex items-center gap-2">
          <FileVideo2 className="h-4 w-4" />
          Nenhum arquivo processado ainda
        </span>
        <span className="font-mono text-xs">0 / 0</span>
      </div>

      <Button size="lg" className="mt-6 w-full" disabled={!selectedFolder}>
        Iniciar importação
      </Button>
    </div>
  );
}
