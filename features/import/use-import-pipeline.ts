'use client';

import { useCallback, useState } from 'react';
import { parseImportPath } from '@/utils/parse-import-path';
import { extractVideoMetadata } from './extract-video-metadata';

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

const VIDEO_EXTENSIONS = /\.(mp4|mkv|mov|m4v|webm)$/i;

export function useImportPipeline() {
  const [items, setItems] = useState<ImportItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  /** Chamado quando o usuário escolhe a pasta — filtra só arquivos de vídeo */
  const loadFolder = useCallback((fileList: FileList) => {
    const videoFiles = Array.from(fileList).filter((f) => VIDEO_EXTENSIONS.test(f.name));

    const nextItems: ImportItem[] = videoFiles.map((file, index) => {
      const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      return {
        id: `${index}-${file.name}`,
        file,
        relativePath,
        status: 'pending',
      };
    });

    setItems(nextItems);
    return nextItems.length;
  }, []);

  /** Processa a fila inteira, um arquivo por vez (evita saturar upload/memória) */
  const startImport = useCallback(async () => {
    setIsRunning(true);

    // Usamos uma cópia local para poder atualizar sequencialmente sem
    // depender de closures desatualizadas do estado do React.
    let currentItems = [...items];

    const updateItem = (id: string, patch: Partial<ImportItem>) => {
      currentItems = currentItems.map((it) => (it.id === id ? { ...it, ...patch } : it));
      setItems(currentItems);
    };

    for (const item of currentItems) {
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
          continue;
        }

        if (result.skipped) {
          updateItem(item.id, { status: 'skipped' });
          continue;
        }

        updateItem(item.id, { status: 'done' });
      } catch (err) {
        updateItem(item.id, {
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Erro inesperado.',
        });
      }
    }

    setIsRunning(false);
  }, [items]);

  const progress = {
    total: items.length,
    done: items.filter((i) => i.status === 'done' || i.status === 'skipped').length,
    errors: items.filter((i) => i.status === 'error').length,
  };

  return { items, loadFolder, startImport, isRunning, progress };
}
