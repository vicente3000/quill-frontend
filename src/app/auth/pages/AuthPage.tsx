import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getApiErrorMessage } from '../../../shared/api/get-api-error-message';
import { labels, auth } from '../../../shared/content/strings';
import { PasswordField } from '../../../shared/components/PasswordField';
import { useAuth } from '../hooks/use-auth';
import { button, surface, gradient } from '../../../shared/design-system/surfaces';
import { fieldLabel, fieldError, textSoft } from '../../../shared/design-system/typography';
import { authGrid, authHero, authCard, authTabs, authTabButton, authTabActive, authStatusStack, heroMetrics, heroMetricCard, formGrid, fieldGroup } from '../../../shared/design-system/layout';
import { inputBase, successMessage as successMsgClass, errorMessage as errorMsgClass } from '../../../shared/design-system/forms';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo valido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
});

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Ingresa tu nombre completo.'),
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guion bajo.')
      .optional()
      .or(z.literal('')),
    email: z.string().email('Ingresa un correo valido.'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z
      .string()
      .min(8, 'Confirma la contraseña con al menos 8 caracteres.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas deben coincidir.',
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      void navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleLogin = loginForm.handleSubmit(async (values) => {
    try {
      setErrorMessage(null);
      await login(values);
      void navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          auth.login.error,
        ),
      );
    }
  });

  const handleRegister = registerForm.handleSubmit(async (values) => {
    try {
      setErrorMessage(null);
      const result = await register({
        fullName: values.fullName,
        username: values.username || undefined,
        email: values.email,
        password: values.password,
      });

      const usernameMsg = result.username ? ` (usuario: ${result.username})` : '';
      setSuccessMessage(result.message + usernameMsg);
      setMode('login');
      registerForm.reset();
      loginForm.reset({
        email: values.email,
        password: '',
      });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          auth.register.error,
        ),
      );
    }
  });

  return (
    <main className={authGrid}>
      <section className={`${surface.xl} ${gradient.hero} ${authHero}`}>
        <div>
          {/* <p className="mt-5 text-[0.8rem] tracking-[0.12em] uppercase font-semibold text-[var(--main-page-inverse-text-muted)]">
            Quill · Atelynx
          </p> */}
          <p className="m-0 text-[0.85rem] tracking-[0.16em] uppercase font-bold text-[var(--main-page-inverse-text-muted)]">{auth.hero.subtitle}</p>
          <h1 className="my-4 text-[clamp(2.3rem,4vw,4.5rem)] leading-[0.95]">{auth.hero.headline}</h1>
          <p className="m-0 text-[1.08rem] text-[var(--main-page-inverse-text-soft)]">
            {auth.hero.description}
          </p>
        </div>

        <div className={heroMetrics}>
          {auth.hero.metrics.map((metric) => (
            <article key={metric.title} className={heroMetricCard}>
              <strong className="text-[var(--main-page-inverse-text-soft)]">{metric.title}</strong>
              <span className="block mt-1 text-[var(--main-page-inverse-text-muted)]">{metric.text}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={`${surface.xl} ${gradient.card} ${authCard}`}>
        <div className={authTabs} role="tablist" aria-label={auth.tabAriaLabel}>
          <button
            aria-selected={mode === 'login'}
            className={`${authTabButton} ${mode === 'login' ? authTabActive : ''}`}
            onClick={() => {
              setErrorMessage(null);
              setMode('login');
            }}
            type="button"
          >
            {labels.action.login}
          </button>
          <button
            aria-selected={mode === 'register'}
            className={`${authTabButton} ${mode === 'register' ? authTabActive : ''}`}
            onClick={() => {
              setErrorMessage(null);
              setMode('register');
            }}
            type="button"
          >
            {labels.action.register}
          </button>
        </div>

        <div className={authStatusStack} aria-live="polite">
          {successMessage ? (
            <p className={successMsgClass}>{successMessage}</p>
          ) : null}
          {errorMessage ? <p className={errorMsgClass}>{errorMessage}</p> : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-start">
          {mode === 'login' ? (
            <form className={formGrid} onSubmit={handleLogin}>
              <label className={fieldGroup}>
                <span className={fieldLabel}>{auth.login.emailLabel}</span>
                <input className={inputBase} type="email" {...loginForm.register('email')} />
                <span className={fieldError}>
                  {loginForm.formState.errors.email?.message}
                </span>
              </label>

              <PasswordField
                error={loginForm.formState.errors.password?.message}
                hint={auth.login.passwordHint}
                label={auth.login.passwordLabel}
                {...loginForm.register('password')}
              />

              <button
                className={`${button.base} ${button.primary}`}
                disabled={loginForm.formState.isSubmitting}
                type="submit"
              >
                {loginForm.formState.isSubmitting ? labels.action.loggingIn : labels.action.enterQuill}
              </button>
            </form>
          ) : (
            <form className={formGrid} onSubmit={handleRegister}>
              <label className={fieldGroup}>
                <span className={fieldLabel}>{labels.field.fullName}</span>
                <input className={inputBase} type="text" {...registerForm.register('fullName')} />
                <span className={fieldError}>
                  {registerForm.formState.errors.fullName?.message}
                </span>
              </label>

              <label className={fieldGroup}>
                <span className={fieldLabel}>{auth.register.usernameLabel}</span>
                <input className={inputBase} type="text" placeholder={labels.field.usernamePlaceholder} {...registerForm.register('username')} />
                <span className={fieldError}>
                  {registerForm.formState.errors.username?.message}
                </span>
              </label>

              <label className={fieldGroup}>
                <span className={fieldLabel}>{auth.register.emailLabel}</span>
                <input className={inputBase} type="email" {...registerForm.register('email')} />
                <span className={fieldError}>
                  {registerForm.formState.errors.email?.message}
                </span>
              </label>

              <PasswordField
                error={registerForm.formState.errors.password?.message}
                hint={auth.register.passwordHint}
                label={auth.register.passwordLabel}
                {...registerForm.register('password')}
              />

              <PasswordField
                error={registerForm.formState.errors.confirmPassword?.message}
                hint={auth.register.confirmHint}
                label={labels.field.confirmPassword}
                {...registerForm.register('confirmPassword')}
              />

              <button
                className={`${button.base} ${button.primary}`}
                disabled={registerForm.formState.isSubmitting}
                type="submit"
              >
                {registerForm.formState.isSubmitting
                  ? labels.action.creatingAccount
                  : labels.action.register}
              </button>
            </form>
          )}
        </div>

        <p className={`mt-4 text-[0.95rem] ${textSoft}`}>
          {auth.footer}
        </p>

      </section>
    </main>
  );
}
