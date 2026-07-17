import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

/**
 * Layout da área /admin.
 *
 * Propositalmente SEM Sidebar e SEM PlayerBar do app principal — é um
 * espaço separado, de uso exclusivo de quem administra a biblioteca
 * (você). Por enquanto qualquer pessoa com o link ainda consegue abrir
 * esta área (o login fica para o final do projeto, por decisão sua), mas
 * a separação de layout já deixa claro que este não é um espaço do
 * "aplicativo" comum.
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
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-vinil-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          Painel administrativo
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
