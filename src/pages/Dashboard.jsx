import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    // If not connected to a real Supabase yet, use mock data
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setSubscribers([
        { id: '1', first_name: 'Emma', last_name: 'Woodhouse', email: 'emma@example.com', intent_status: 'warm', next_suggested_action: 'Send Personal Connection template', next_action_due_date: new Date().toISOString() },
        { id: '2', first_name: 'Jane', last_name: 'Fairfax', email: 'jane@example.com', intent_status: 'active', next_suggested_action: 'Send Pricing & Details template', next_action_due_date: new Date(Date.now() - 86400000).toISOString() },
      ]);
      setLoading(false);
      return;
    }

    if (user) {
      api.getSubscribers()
        .then(data => {
          setSubscribers(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  const now = new Date();
  
  // Filter for people who need follow up today or earlier
  const dueFollowUps = subscribers.filter(s => {
    if (!s.next_action_due_date) return false;
    return new Date(s.next_action_due_date) <= now;
  });

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)' }}>Welcome Back</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Here is an overview of your retreat relationships.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.25rem' }}>Requires Attention</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            People waiting for a response or a scheduled follow-up.
          </p>
          
          {dueFollowUps.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: 'var(--color-text-light)' }}>You are all caught up!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dueFollowUps.map(sub => (
                <li key={sub.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', paddingTop: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{sub.first_name} {sub.last_name}</strong>
                      <a href={`/subscribers/${sub.id}`} style={{ textDecoration: 'none' }}>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          color: 'var(--color-accent-secondary)', 
                          fontWeight: 'bold',
                          padding: '0.15rem 0.4rem',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-bg-card)',
                          cursor: 'pointer'
                        }}>
                          {sub.intent_status.toUpperCase()}
                        </span>
                      </a>
                    </div>
                    <a href={`/subscribers/${sub.id}`} style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      Open &rarr;
                    </a>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                    {sub.next_suggested_action}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="card">
          <h2 style={{ fontSize: '1.25rem' }}>Overview</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Subscribers</span>
              <strong>{subscribers.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Warm Leads</span>
              <strong>{subscribers.filter(s => s.intent_status === 'warm').length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Inquiries</span>
              <strong>{subscribers.filter(s => s.intent_status === 'active' || s.intent_status === 'curious').length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Booked</span>
              <strong>{subscribers.filter(s => s.intent_status === 'booked').length}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
