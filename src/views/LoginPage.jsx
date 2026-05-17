import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/Layout';
import { useApp } from '../state/AppContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = (event) => {
    event.preventDefault();
    const result = login(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Login to continue your browser-based exam flow with saved attempts and reports."
      aside={<ul className="feature-list"><li>Auto submit after 60 minutes</li><li>Manual submit any time before timer ends</li><li>Detailed report after each attempt</li></ul>}
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <label><span>Email</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" /></label>
        <label><span>Password</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" /></label>
        {error ? <p className="message error">{error}</p> : null}
        <button className="primary-btn" type="submit">Login</button>
        <p className="muted-line">New user? <Link to="/register">Create account</Link></p>
      </form>
    </AuthShell>
  );
}
