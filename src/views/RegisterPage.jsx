import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/Layout';
import { useApp } from '../state/AppContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill all fields.');
      return;
    }
    const result = register(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <AuthShell
      title="Create your exam account"
      subtitle="Register with name, email, and password to start your 150-question networking exam."
      aside={<div className="hero-stats"><div><strong>150</strong><span>Questions</span></div><div><strong>60m</strong><span>Total time</span></div><div><strong>3</strong><span>Attempts</span></div></div>}
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <label><span>Name</span><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" /></label>
        <label><span>Email</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" /></label>
        <label><span>Password</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create password" /></label>
        {error ? <p className="message error">{error}</p> : null}
        <button className="primary-btn" type="submit">Register</button>
        <p className="muted-line">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </AuthShell>
  );
}
