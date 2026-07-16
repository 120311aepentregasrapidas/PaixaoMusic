import { Sidebar } from '@/components/layout/sidebar';
import { PlayerBar } from '@/components/player/player-bar';
import { MediaEngine } from '@/features/player/media-engine';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <PlayerBar />
      <MediaEngine />
    </div>
  );
}
