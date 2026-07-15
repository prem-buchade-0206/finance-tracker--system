// src/features/auth/pages/LoginPage.tsx
// Functional now, not a placeholder: validates via Zod, and on submit sets
// a session token so ProtectedRoute unlocks — this lets the router be
// exercised end-to-end today. The `handleLogin` function is the ONLY thing
// that changes when features/auth's real login mutation (POST /auth/login
// via TanStack Query) is generated; the form itself doesn't need to change.
//
// Now consumes the shared Input/Button primitives instead of raw <input>/
// <button> elements — first real usage of shared/components outside their
// own definitions, which is a useful sanity check that their public APIs
// (label/error/helperText props, forwardRef) actually work end-to-end.

import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { useAuth } from '@/shared/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage(): JSX.Element {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const redirectTo =
    (location.state as { from?: Location } | null)?.from?.pathname ?? '/dashboard';

  const handleLogin = handleSubmit(async (values) => {
    // TODO-FOR-NEXT-STEP (not a silent placeholder — flagged explicitly):
    // replace with the real login mutation from features/auth once its
    // api/services layer is generated. For now this unblocks router testing.
    await new Promise((resolve) => setTimeout(resolve, 400));
    setToken(`dev-session-${values.email}`);
    navigate(redirectTo, { replace: true });
  });

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-6">
      <form
        onSubmit={(e) => void handleLogin(e)}
        className="glass-surface w-full max-w-sm rounded-2xl p-8"
        noValidate
      >
        <h1 className="font-display text-2xl font-semibold text-text-primary">Sign in</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Access your accounts, budgets, and spending insights.
        </p>

        <div className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            required
            {...register('password')}
          />
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          disableMagnetic
          className="mt-6 w-full"
        >
          Sign in
        </Button>
      </form>
    </div>
  );
}
