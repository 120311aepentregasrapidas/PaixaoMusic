'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { detectDeviceType, isTvLikeDevice } from '@/utils/detect-device-type';
import { usePlayerStore } from '@/store/player-store';

/**
 * Roda uma vez ao carregar o app:
 *   - marca <html data-device="..."> para o CSS aplicar ajustes de Smart TV
 *     (foco maior, alvos de clique maiores — ver globals.css)
 *   - no Android Auto, força o modo de reprodução para "apenas áudio"
 *     automaticamente (o Readme pede isso: vídeo não deve tocar dirigindo)
 */
export function DeviceBootstrap() {
  const setPlaybackMode = usePlayerStore((s) => s.setPlaybackMode);

  useEffect(() => {
    const deviceType = detectDeviceType();
    document.documentElement.dataset.device = deviceType;

    if (isTvLikeDevice(deviceType)) {
      document.documentElement.dataset.tv = 'true';
    }

    if (deviceType === 'android_auto') {
      setPlaybackMode('audio');
    }

    // Registro "best effort" do dispositivo — não bloqueia nada se falhar
    // (ex.: sessão anônima ainda não pronta na primeira renderização).
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        await supabase.from('devices').insert({
          user_id: session.user.id,
          device_type: deviceType,
          device_name: `${deviceType} — ${new Date().toLocaleDateString('pt-BR')}`,
        });
      } catch {
        // registro de dispositivo é informativo, nunca crítico
      }
    })();
  }, [setPlaybackMode]);

  return null;
}
