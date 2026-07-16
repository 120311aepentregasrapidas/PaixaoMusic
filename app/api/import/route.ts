import { NextResponse, type NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getStorageProvider } from '@/lib/storage';
import { ImportRepository } from '@/repositories/import.repository';

// Precisa rodar em Node.js (não Edge) — o SDK do Supabase e o upload de
// arquivo binário para o Archive.org dependem de APIs do Node.
export const runtime = 'nodejs';
// Uploads de vídeo demoram — evita timeout prematuro em planos que permitem
// funções mais longas (no plano Hobby da Vercel o teto real é 10s-60s de
// qualquer forma; ver aviso sobre tamanho de arquivo abaixo).
export const maxDuration = 60;

/**
 * POST /api/import
 *
 * ⚠️ LIMITAÇÃO IMPORTANTE DE HOSPEDAGEM:
 * Funções serverless da Vercel (planos Hobby/Pro padrão) têm um limite de
 * corpo de requisição por volta de 4.5 MB. Videoclipes normalmente pesam
 * dezenas/centenas de MB — ou seja, **esta rota vai falhar para arquivos
 * grandes quando o site estiver publicado na Vercel**.
 *
 * Para importar sua coleção de verdade, rode o projeto localmente
 * (`npm run dev`, que não tem esse limite) e use o painel em
 * http://localhost:3000/admin/importar. Depois de importado, os vídeos já
 * ficam disponíveis também na versão publicada (o Supabase é o mesmo banco).
 *
 * Uma melhoria futura documentada no README é migrar este fluxo para upload
 * direto do navegador para o storage (bypassando o servidor da Vercel
 * completamente), o que remove essa limitação.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const file = formData.get('file');
  const artistName = formData.get('artistName')?.toString();
  const albumName = formData.get('albumName')?.toString() || null;
  const title = formData.get('title')?.toString();
  const trackNumberRaw = formData.get('trackNumber')?.toString();
  const originalPath = formData.get('originalPath')?.toString() ?? '';
  const durationSeconds = parseNullableNumber(formData.get('durationSeconds'));
  const width = parseNullableNumber(formData.get('width'));
  const height = parseNullableNumber(formData.get('height'));

  if (!(file instanceof File) || !artistName || !title) {
    return NextResponse.json(
      { error: 'Campos obrigatórios ausentes (file, artistName, title).' },
      { status: 400 },
    );
  }

  const db = createServiceRoleClient();
  const repo = new ImportRepository(db);

  try {
    // Evita reimportar o mesmo arquivo duas vezes
    const existing = await repo.findExistingVideoByFilename(file.name);
    if (existing) {
      return NextResponse.json(
        { skipped: true, reason: 'Arquivo já importado anteriormente.' },
        { status: 200 },
      );
    }

    const provider = getStorageProvider();
    const storageProviderRow = await repo.getActiveStorageProvider();

    const artist = await repo.findOrCreateArtist(artistName);
    const album = albumName ? await repo.findOrCreateAlbum(artist.id, albumName) : null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await provider.upload({
      key: `${artistName}-${album ? albumName : ''}-${title}`,
      file: buffer,
      filename: file.name,
      contentType: file.type || 'video/mp4',
      metadata: { artist: artistName, album: albumName ?? '', title },
    });

    const video = await repo.createVideo({
      storageProviderId: storageProviderRow.id,
      storageKey: uploadResult.storageKey,
      originalFilename: file.name,
      originalPath,
      durationSeconds,
      width,
      height,
      fileSizeBytes: file.size,
    });

    const song = await repo.createSong({
      videoId: video.id,
      artistId: artist.id,
      albumId: album?.id ?? null,
      title,
      trackNumber: trackNumberRaw ? parseInt(trackNumberRaw, 10) : null,
    });

    return NextResponse.json({ success: true, songId: song.id, videoId: video.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido na importação.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseNullableNumber(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const parsed = parseFloat(value.toString());
  return Number.isFinite(parsed) ? parsed : null;
}
