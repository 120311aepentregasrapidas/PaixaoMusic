import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  Search,
  Library,
  Heart,
  History,
  ListMusic,
  Mic2,
  Disc3,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ThemeSwitcher } from './theme-switcher';

const primaryLinks = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/pesquisa', label: 'Pesquisar', icon: Search },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library },
];

const libraryLinks = [
  { href: '/favoritos', label: 'Favoritos', icon: Heart },
  { href: '/historico', label: 'Histórico', icon: History },
  { href: '/generos', label: 'Gêneros', icon: Disc3 },
  { href: '/estatisticas', label: 'Estatísticas', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col overflow-y-auto border-r border-white/5 bg-ink-950/60 px-4 py-6">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <Image
          src="/logo.png"
          alt="Paixão Music"
          width={56}
          height={56}
          className="rounded-xl shadow-lg shadow-paixao-500/10"
          priority
        />
        <span className="font-display text-xl font-semibold tracking-tight text-parchment-50">
          Paixão Music
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {primaryLinks.map((link) => (
          <SidebarLink key={link.href} {...link} />
        ))}
      </nav>

      <div className="sprocket-divider my-5" />

      <nav className="flex flex-col gap-1">
        {libraryLinks.map((link) => (
          <SidebarLink key={link.href} {...link} />
        ))}
      </nav>

      <div className="sprocket-divider my-5" />

      <div className="flex items-center gap-2 px-3 text-xs font-medium uppercase tracking-wider text-parchment-500">
        <ListMusic className="h-3.5 w-3.5" />
        Suas playlists
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <p className="px-3 py-2 text-sm text-parchment-500">
          Nenhuma playlist ainda. Crie uma na Biblioteca.
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between px-3 py-3">
        <span className="text-xs text-parchment-500">Tema</span>
        <ThemeSwitcher />
      </div>

      <div className="flex items-center gap-2 rounded-lg px-3 py-3 text-xs text-parchment-500">
        <Mic2 className="h-4 w-4 shrink-0" />
        <span>Rádio Inteligente disponível na página de qualquer artista.</span>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-parchment-300',
        'transition-colors hover:bg-white/5 hover:text-parchment-50',
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </Link>
  );
}
