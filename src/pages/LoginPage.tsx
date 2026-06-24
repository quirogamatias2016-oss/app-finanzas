import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resolvePostLoginPath } from '../routes/paths';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isFirstSetup, registeredUsername } = useAuth();
  const [username, setUsername] = useState(() => registeredUsername ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await login(username, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setError('');
    setPassword('');

    const from = (location.state as { from?: string } | null)?.from;
    navigate(resolvePostLoginPath(from), { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <span className="login-card__logo">F</span>
          <div>
            <p className="login-card__eyebrow">Bienvenido</p>
            <h1>App Finanzas</h1>
          </div>
        </div>

        <p className="login-card__description">
          {isFirstSetup
            ? 'Crea tu usuario local para empezar a gestionar tus finanzas.'
            : `Inicia sesión como «${registeredUsername}» para acceder a tu panel.`}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Usuario</span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Tu usuario"
              readOnly={!isFirstSetup && Boolean(registeredUsername)}
              required
            />
          </label>

          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              autoComplete={isFirstSetup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
              required
            />
          </label>

          {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

          <button type="submit" className="btn btn--primary btn--block">
            {isFirstSetup ? 'Crear cuenta y entrar' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="login-card__note">
          Sesión persistente en este dispositivo. Un solo usuario local por app.
        </p>
      </div>
    </div>
  );
}
