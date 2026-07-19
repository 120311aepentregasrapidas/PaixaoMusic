import type { SupabaseClient } from '@supabase/supabase-js';
import type { DeviceType } from '@/types/database';

export class DevicesRepository {
  constructor(private readonly db: SupabaseClient) {}

  async registerDevice(userId: string, deviceType: DeviceType, deviceName: string): Promise<void> {
    await this.db
      .from('devices')
      .insert({ user_id: userId, device_type: deviceType, device_name: deviceName });
  }
}
