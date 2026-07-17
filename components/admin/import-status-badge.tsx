'use client';

import Link from 'next/link';
import { UploadCloud } from 'lucide-react';
import { useImportProgress } from '@/store/import-store';

/**
 * Badge flutuante que aparece em QUALQUER página enquanto uma importação
 * está rodando em segundo plano. Isso é o que permite ao usuário navegar
 * livremente pelo site (ouvir música, ver a biblioteca) sem ficar preso
 * na tela de importação — clicando no badge, volta direto pra lá.
 *
 * Fica escondido quando não há importação em andamento.
 */
export function ImportStatusBadge() {
  const progress = useImportProgress();

  if (!progress.isRunning && progress.total === 0) return null;
  if (!progress.isRunning && progress.done === progress.total) return null;

  return (
    <Link
      href="/admin/importar"
      className="fixed left-4 top-4 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-ink-900/95 px-4 py-2.5 text-sm shadow-2xl backdrop-blur transition-colors hover:bg-ink-800"
    >
      <UploadCloud className="h-4 w-4 animate-pulse-rec text-paixao-500" />
      <span className="text-parchment-100">
        Importando {progress.done}/{progress.total}
      </span>
    </Link>
  );
}
