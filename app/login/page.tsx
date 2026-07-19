import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image src="/logo.png" alt="Paixão Music" width={56} height={56} className="rounded-xl" priority />
          <h1 className="font-display text-xl font-semibold text-parchment-50">Acesso administrativo</h1>
          <p className="text-sm text-parchment-500">
            Só quem tiver acesso aqui pode importar e gerenciar a biblioteca.
          </p>
        </div>

        <LoginForm />

        <Link
          href="/"
          className="mt-6 block text-center text-xs text-parchment-500 hover:text-parchment-300"
        >
          Voltar para o app
        </Link>
      </div>
    </div>
  );
}
