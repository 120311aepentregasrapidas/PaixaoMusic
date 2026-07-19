'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'signin'>('create');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyLoggedEmail, setAlreadyLoggedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      // is_anonymous existe na sessão real (usuário já converteu a conta)
      if (user && user.email && !user.is_anonymous) {
        setAlreadyLoggedEmail(user.email);
      }
    });
  }, []);

  const onSubmit = async (values: FormValues) => {
    setStatus('loading');
    setErrorMessage(null);
    const supabase = createClient();

    if (mode === 'create') {
      // Converte a sessão anônima atual (dona dos favoritos/histórico já
      // registrados neste dispositivo) em uma conta permanente. O
      // auth.uid() continua o mesmo — nada se perde.
      const { error } = await supabase.auth.updateUser({ email: values.email, password: values.password });
      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }
    }

    router.push('/admin/importar');
    router.refresh();
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (alreadyLoggedEmail) {
    return (
      <div className="text-center">
        <p className="text-sm text-parchment-300">
          Você já está autenticado como <strong>{alreadyLoggedEmail}</strong>.
        </p>
        <Button variant="secondary" className="mt-4" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-full border border-white/10 p-1">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            mode === 'create' ? 'bg-paixao-500 text-white' : 'text-parchment-500'
          }`}
        >
          Criar meu acesso
        </button>
        <button
          onClick={() => setMode('signin')}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            mode === 'signin' ? 'bg-paixao-500 text-white' : 'text-parchment-500'
          }`}
        >
          Entrar
        </button>
      </div>

      {mode === 'create' && (
        <p className="mb-4 text-xs text-parchment-500">
          Isso transforma este dispositivo no seu acesso permanente — seus favoritos e histórico
          já registrados aqui continuam exatamente como estão.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="seu@email.com"
            className="w-full rounded-lg border border-white/10 bg-ink-800/60 px-4 py-2.5 text-sm text-parchment-50 placeholder:text-parchment-500 focus:border-paixao-500/50"
          />
          {errors.email && <p className="mt-1 text-xs text-paixao-400">{errors.email.message}</p>}
        </div>
        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Senha"
            className="w-full rounded-lg border border-white/10 bg-ink-800/60 px-4 py-2.5 text-sm text-parchment-50 placeholder:text-parchment-500 focus:border-paixao-500/50"
          />
          {errors.password && <p className="mt-1 text-xs text-paixao-400">{errors.password.message}</p>}
        </div>

        {errorMessage && <p className="text-xs text-paixao-400">{errorMessage}</p>}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Enviando...' : mode === 'create' ? 'Criar meu acesso' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
}
