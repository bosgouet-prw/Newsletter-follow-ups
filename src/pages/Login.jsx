import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        throw error;
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: 'var(--color-bg-main)' 
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2.5rem', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: '2rem',
          color: 'var(--color-text-main)', 
          marginBottom: '0.5rem' 
        }}>
          Retreat Manager
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Welcome back. Please sign in to your account.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
              Email Address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-subtle)'
              }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-subtle)'
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ color: 'var(--color-accent-secondary)', fontSize: '0.85rem', fontWeight: 500, padding: '0.5rem', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent-secondary)' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
