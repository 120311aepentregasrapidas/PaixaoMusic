import Link from 'next/link';
import { ArrowLeft, ShieldAlert, KeyRound } from 'lucide-react';

/**
 * Layout da área /admin.
 *
 * Propositalmente SEM Sidebar e SEM PlayerBar do app principal — é um
 * espaço separado, de uso exclusivo de quem administra a biblioteca.
 * Protegido de verdade pelo middleware (ver middleware.ts): só sessões
 * com profiles.role em ('owner', 'admin') passam — qualquer outra pessoa
 * é redirecionada para /login.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-parchment-500 hover:text-parchment-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o app
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-vinil-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            Painel administrativo
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs text-parchment-500 hover:text-parchment-100"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Acesso
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
