import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getStorageProvider } from '@/lib/storage';

/**
 * GET /api/stream/[id]
 *
 * Recebe o id de um `video`, resolve a storage_key no banco e delega ao
 * Storage Provider ativo a geração da URL de streaming — o player nunca
 * conhece o provider concreto, apenas chama esta rota.
 *
 * Redireciona (302) para a URL final, o que preserva suporte a HTTP Range
 * (necessário para seek) feito pelo próprio provider/CDN.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const db = createServerSupabaseClient();

  const { data: video, error } = await db
    .from('videos')
    .select('storage_key, import_status')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !video) {
    return NextResponse.json({ error: 'Vídeo não encontrado.' }, { status: 404 });
  }

  if (video.import_status !== 'ready') {
    return NextResponse.json(
      { error: 'Este vídeo ainda está sendo processado.' },
      { status: 409 },
    );
  }

  const provider = getStorageProvider();
  const streamUrl = await provider.getStreamUrl(video.storage_key);

  return NextResponse.redirect(streamUrl, { status: 302 });
}
