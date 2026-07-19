import { create } from 'zustand';
import { parseImportPath } from '@/utils/parse-import-path';
import { extractVideoMetadata } from '@/features/import/extract-video-metadata';

export type ImportItemStatus = 'pending' | 'reading' | 'uploading' | 'done' | 'error' | 'skipped';

export interface ImportItem {
  id: string;
  file: File;
  relativePath: string;
  status: ImportItemStatus;
  parsedTitle?: string;
  parsedArtist?: string;
  parsedAlbum?: string | null;
  errorMessage?: string;
}

interface ImportState {
  items: ImportItem[];
  isRunning: boolean;
  loadFolder: (fileList: FileList) => number;
  startImport: () => Promise<void>;
}

const VIDEO_EXTENSIONS = /\.(mp4|mkv|mov|m4v|webm)$/i;

// Uploads rodam em paralelo, mas limitados a um pequeno número simultâneo.
// Isso acelera bibliotecas grandes sem: (a) saturar a memória do navegador
// carregando centenas de arquivos de uma vez, nem (b) sobrecarregar a
// função serverless da Vercel/Archive.org com dezenas de uploads ao mesmo
// tempo. 3 é um valor conservador — pode ser ajustado conforme a banda
// disponível.
const CONCURRENCY = 3;

/**
 * Store global (não um hook local!) de propósito: a importação de centenas
 * de vídeos pode levar bastante tempo. Como este estado vive fora de
 * qualquer componente de página, sair da tela de importação e navegar para
 * a Biblioteca, o Player etc. NÃO cancela o processo — ele roda em segundo
 * plano até terminar, e o `ImportStatusBadge` (visível em qualquer página)
 * mostra o progresso.
 */
export const useImportStore = create<ImportState>((set, get) => ({
  items: [],
  isRunning: false,

  loadFolder: (fileList) => {
    const videoFiles = Array.from(fileList).filter((f) => VIDEO_EXTENSIONS.test(f.name));

    const nextItems: ImportItem[] = videoFiles.map((file, index) => {
      const relativePath =
        (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      return {
        id: `${index}-${file.name}`,
        file,
        relativePath,
        status: 'pending',
      };
    });

    set({ items: nextItems });
    return nextItems.length;
  },

  startImport: async () => {
    set({ isRunning: true });

    const updateItem = (id: string, patch: Partial<ImportItem>) => {
      set((state) => ({
        items: state.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      }));
    };

    // Copia a lista no início — evita reprocessar itens adicionados no meio do caminho
    const queue = [...get().items];

    const processOne = async (item: ImportItem) => {
      try {
        updateItem(item.id, { status: 'reading' });

        const parsed = parseImportPath(item.relativePath, item.file.name);
        const metadata = await extractVideoMetadata(item.file);

        updateItem(item.id, {
          status: 'uploading',
          parsedTitle: parsed.title,
          parsedArtist: parsed.artistName,
          parsedAlbum: parsed.albumName,
        });

        const formData = new FormData();
        formData.set('file', item.file);
        formData.set('artistName', parsed.artistName);
        if (parsed.albumName) formData.set('albumName', parsed.albumName);
        formData.set('title', parsed.title);
        if (parsed.trackNumber != null) formData.set('trackNumber', String(parsed.trackNumber));
        formData.set('originalPath', parsed.originalPath);
        if (metadata.durationSeconds != null)
          formData.set('durationSeconds', String(metadata.durationSeconds));
        if (metadata.width != null) formData.set('width', String(metadata.width));
        if (metadata.height != null) formData.set('height', String(metadata.height));

        const response = await fetch('/api/import', { method: 'POST', body: formData });
        const result = await response.json();

        if (!response.ok) {
          updateItem(item.id, { status: 'error', errorMessage: result.error ?? 'Falha na importação.' });
          return;
        }

        if (result.skipped) {
          updateItem(item.id, { status: 'skipped' });
          return;
        }

        updateItem(item.id, { status: 'done' });
      } catch (err) {
        updateItem(item.id, {
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Erro inesperado.',
        });
      }
    };

    // Pool de concorrência simples: N "workers" consomem da mesma fila até
    // esvaziar. Evita a complexidade de uma lib externa para algo tão direto.
    let cursor = 0;
    const worker = async () => {
      while (cursor < queue.length) {
        const item = queue[cursor];
        cursor += 1;
        if (item) await processOne(item);
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));

    set({ isRunning: false });
  },
}));

export function useImportProgress() {
  return useImportStore((s) => ({
    total: s.items.length,
    done: s.items.filter((i) => i.status === 'done' || i.status === 'skipped').length,
    errors: s.items.filter((i) => i.status === 'error').length,
    isRunning: s.isRunning,
  }));
}
