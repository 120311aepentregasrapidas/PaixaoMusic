import type { SupabaseClient } from '@supabase/supabase-js';
import type { PlaybackMode } from '@/store/player-store';

export class HistoryRepository {
  constructor(private readonly db: SupabaseClient) {}

  async createEntry(userId: string, songId: string, mode: PlaybackMode): Promise<string | null> {
    const { data, error } = await this.db
      .from('history')
      .insert({ user_id: userId, song_id: songId, playback_mode: mode })
      .select('id')
      .single();

    if (error) return null;
    return data.id;
  }

  async updateProgress(entryId: string, progressSeconds: number, watchedSeconds: number): Promise<void> {
    await this.db
      .from('history')
      .update({ progress_seconds: progressSeconds, watched_seconds: watchedSeconds })
      .eq('id', entryId);
  }

  /** Últimas reproduções (para a página /historico) */
  async listRecent(userId: string, limit = 50): Promise<Array<{ songId: string; playedAt: string }>> {
    const { data, error } = await this.db
      .from('history')
      .select('song_id, played_at')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data ?? []).map((row: { song_id: string; played_at: string }) => ({
      songId: row.song_id,
      playedAt: row.played_at,
    }));
  }

  /** Músicas com reprodução incompleta — "Continuar assistindo" */
  async getContinueWatching(userId: string, limit = 12): Promise<Array<{ songId: string; progressSeconds: number }>> {
    const { data, error } = await this.db
      .from('continue_watching')
      .select('song_id, progress_seconds')
      .eq('user_id', userId)
      .limit(limit);

    if (error) return [];
    return (data ?? []).map((row: { song_id: string; progress_seconds: number }) => ({
      songId: row.song_id,
      progressSeconds: row.progress_seconds,
    }));
  }
}
