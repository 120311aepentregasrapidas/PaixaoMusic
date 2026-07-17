'use client';

import { FolderInput, FileVideo2, CheckCircle2, XCircle, Loader2, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImportStore, useImportProgress } from '@/store/import-store';

export default function ImportarPage() {
  const items = useImportStore((s) => s.items);
  const loadFolder = useImportStore((s) => s.loadFolder);
  const startImport = useImportStore((s) => s.startImport);
  const progress = useImportProgress();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-2xl font-semibold text-parchment-50">Importar coleção</h1>
      <p className="mt-2 text-sm text-parchment-500">
        Escolha a pasta raiz da sua videoteca (ex.: <code className="font-mono">Músicas/</code>).
        O sistema varre todas as subpastas, identifica cada vídeo e importa automaticamente.
      </p>

      <div className="mt-4 rounded-lg border border-vinil-500/30 bg-vinil-500/5 px-4 py-3 text-xs text-vinil-300">
        <strong>Aviso:</strong> se este site estiver publicado na Vercel, arquivos de vídeo
        grandes podem falhar no upload (limite de tamanho da hospedagem). Para importar sua
        coleção completa, rode o projeto localmente (<code className="font-mono">npm run dev</code>)
        e use esta mesma tela em <code className="font-mono">localhost:3000</code>.
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-ink-800/40 px-4 py-3 text-xs text-parchment-500">
        Pode navegar para qualquer outra página do site enquanto a importação roda — ela
        continua em segundo plano. Um indicador de progresso aparece no canto da tela até
        terminar.
      </div>

      <label
        htmlFor="folder-input"
        className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-ink-800/40 px-6 py-14 text-center transition-colors hover:border-paixao-500/60 hover:bg-ink-800/60"
      >
        <FolderInput className="h-8 w-8 text-paixao-500" />
        <span className="font-medium text-parchment-50">
          {items.length > 0 ? `${items.length} vídeos encontrados` : 'Clique para escolher uma pasta'}
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
            if (e.target.files) loadFolder(e.target.files);
          }}
        />
      </label>

      <div className="mt-6 flex items-center justify-between rounded-lg bg-ink-800/40 px-4 py-3 text-sm text-parchment-500">
        <span className="flex items-center gap-2">
          <FileVideo2 className="h-4 w-4" />
          {progress.errors > 0
            ? `${progress.errors} com erro`
            : progress.isRunning
              ? 'Importando...'
              : progress.done > 0
                ? 'Importação concluída'
                : 'Nenhum arquivo processado ainda'}
        </span>
        <span className="font-mono text-xs">
          {progress.done} / {progress.total}
        </span>
      </div>

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={items.length === 0 || progress.isRunning}
        onClick={() => startImport()}
      >
        {progress.isRunning ? 'Importando...' : 'Iniciar importação'}
      </Button>

      {items.length > 0 && (
        <ul className="mt-8 max-h-96 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-parchment-300"
            >
              <StatusIcon status={item.status} />
              <div className="min-w-0 flex-1">
                <p className="truncate">{item.parsedTitle ?? item.file.name}</p>
                {item.parsedArtist && (
                  <p className="truncate text-xs text-parchment-500">
                    {item.parsedArtist}
                    {item.parsedAlbum ? ` — ${item.parsedAlbum}` : ''}
                  </p>
                )}
                {item.errorMessage && (
                  <p className="truncate text-xs text-paixao-400">{item.errorMessage}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'done':
      return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />;
    case 'error':
      return <XCircle className="h-4 w-4 shrink-0 text-paixao-500" />;
    case 'skipped':
      return <SkipForward className="h-4 w-4 shrink-0 text-parchment-500" />;
    case 'reading':
    case 'uploading':
      return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-vinil-400" />;
    default:
      return <FileVideo2 className="h-4 w-4 shrink-0 text-parchment-500" />;
  }
}
