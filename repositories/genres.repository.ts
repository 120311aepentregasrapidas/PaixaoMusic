import type { SupabaseClient } from '@supabase/supabase-js';
import type { Genre } from '@/types/database';

export class GenresRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findAll(): Promise<Genre[]> {
    const { data, error } = await this.db.from('genres').select('*').order('name');
    if (error) throw error;
    return (data ?? []).map((row: { id: string; name: string; slug: string }) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
    }));
  }
}
