import type { SupabaseClient } from '@supabase/supabase-js';

export class RatingsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async getRating(userId: string, songId: string): Promise<number | null> {
    const { data } = await this.db
      .from('ratings')
      .select('stars')
      .eq('user_id', userId)
      .eq('song_id', songId)
      .maybeSingle();
    return data?.stars ?? null;
  }

  async setRating(userId: string, songId: string, stars: number): Promise<void> {
    await this.db
      .from('ratings')
      .upsert({ user_id: userId, song_id: songId, stars }, { onConflict: 'user_id,song_id' });
  }
}
