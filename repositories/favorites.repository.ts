import type { SupabaseClient } from '@supabase/supabase-js';

export type FavoriteEntityType = 'song' | 'video' | 'artist' | 'album';

export class FavoritesRepository {
  constructor(private readonly db: SupabaseClient) {}

  async isFavorite(userId: string, entityType: FavoriteEntityType, entityId: string): Promise<boolean> {
    const { data } = await this.db
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .maybeSingle();
    return !!data;
  }

  async toggle(userId: string, entityType: FavoriteEntityType, entityId: string): Promise<boolean> {
    const alreadyFavorite = await this.isFavorite(userId, entityType, entityId);

    if (alreadyFavorite) {
      await this.db
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);
      return false;
    }

    await this.db
      .from('favorites')
      .insert({ user_id: userId, entity_type: entityType, entity_id: entityId });
    return true;
  }

  async listSongIds(userId: string): Promise<string[]> {
    const { data } = await this.db
      .from('favorites')
      .select('entity_id')
      .eq('user_id', userId)
      .eq('entity_type', 'song');
    return (data ?? []).map((row: { entity_id: string }) => row.entity_id);
  }
}
