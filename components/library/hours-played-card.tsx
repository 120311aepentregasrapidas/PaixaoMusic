'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { StatsRepository } from '@/repositories/stats.repository';
import { useCurrentUserId } from '@/hooks/use-current-user';
import { formatHoursMinutes } from '@/utils/format';

export function HoursPlayedCard() {
  const userId = useCurrentUserId();
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    const repo = new StatsRepository(createClient());
    repo.getTotalWatchedSeconds(userId).then(setSeconds);
  }, [userId]);

  return (
    <div className="surface-card flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paixao-500/10 text-paixao-500">
        <Clock className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-parchment-500">Tempo reproduzido</p>
        <p className="font-display text-xl font-semibold text-parchment-50">
          {seconds == null ? '—' : formatHoursMinutes(seconds)}
        </p>
      </div>
    </div>
  );
}
