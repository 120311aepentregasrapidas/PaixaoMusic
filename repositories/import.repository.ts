import type { SupabaseClient } from '@supabase/supabase-js';
import { slugify } from '@/utils/parse-import-path';

/**
 * Repository usado exclusivamente pela rota de importação (`/api/import`),
 * que roda com o client de Service Role (ignora RLS). Por isso este arquivo
 * NUNCA deve ser importado em código que roda no navegador.
 *
 * TODO (quando o login for implementado): trocar o uso do service role aqui
 * por uma checagem explícita "usuário autenticado é admin?" antes de cada
 * chamada, mesmo a rota já rodando no servidor.
 */
export class ImportRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findOrCreateArtist(name: string): Promise<{ id: string }> {
    const slug = slugify(name);

    const { data: existing } = await this.db
      .from('artists')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) return existing;

    const { data: created, error } = await this.db
      .from('artists')
      .insert({ name, slug })
      .select('id')
      .single();

    if (error) throw error;
    return created;
  }

  async findOrCreateAlbum(artistId: string, title: string): Promise<{ id: string }> {
    const slug = slugify(title);

    const { data: existing } = await this.db
      .from('albums')
      .select('id')
      .eq('artist_id', artistId)
      .eq('slug', slug)
      .maybeSingle();

    if (existing) return existing;

    const { data: created, error } = await this.db
      .from('albums')
      .insert({ artist_id: artistId, title, slug })
      .select('id')
      .single();

    if (error) throw error;
    return created;
  }

  async getActiveStorageProvider(): Promise<{ id: string; name: string }> {
    const { data, error } = await this.db
      .from('storage_provider')
      .select('id, name')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new Error(
        'Nenhum storage provider ativo encontrado na tabela storage_provider. ' +
          'Confira se a migration 0001_init.sql foi aplicada corretamente.',
      );
    }
    return data;
  }

  /** Evita reimportar o mesmo arquivo (por nome+tamanho+data, já que ainda não temos checksum real) */
  async findExistingVideoByFilename(originalFilename: string): Promise<{ id: string } | null> {
    const { data } = await this.db
      .from('videos')
      .select('id')
      .eq('original_filename', originalFilename)
      .maybeSingle();
    return data ?? null;
  }

  async createVideo(input: {
    storageProviderId: string;
    storageKey: string;
    originalFilename: string;
    originalPath: string;
    durationSeconds: number | null;
    width: number | null;
    height: number | null;
    fileSizeBytes: number;
  }): Promise<{ id: string }> {
    const { data, error } = await this.db
      .from('videos')
      .insert({
        storage_provider_id: input.storageProviderId,
        storage_key: input.storageKey,
        original_filename: input.originalFilename,
        original_path: input.originalPath,
        duration_seconds: input.durationSeconds,
        width: input.width,
        height: input.height,
        file_size_bytes: input.fileSizeBytes,
        import_status: 'ready',
      })
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }

  async createSong(input: {
    videoId: string;
    artistId: string;
    albumId: string | null;
    title: string;
    trackNumber: number | null;
  }): Promise<{ id: string }> {
    const slug = slugify(input.title);

    const { data, error } = await this.db
      .from('songs')
      .insert({
        video_id: input.videoId,
        artist_id: input.artistId,
        album_id: input.albumId,
        title: input.title,
        slug,
        track_number: input.trackNumber,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }

  async markVideoError(videoId: string, message: string): Promise<void> {
    await this.db
      .from('videos')
      .update({ import_status: 'error', import_error: message })
      .eq('id', videoId);
  }
}
