import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SubscribersList() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'last_contacted_at', direction: 'desc' });

  useEffect(() => {
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setSubscribers([
        { id: '1', first_name: 'Emma', last_name: 'Woodhouse', email: 'emma@example.com', intent_status: 'warm', last_contacted_at: new Date(Date.now() - 1000000).toISOString() },
        { id: '2', first_name: 'Jane', last_name: 'Fairfax', email: 'jane@example.com', intent_status: 'active', last_contacted_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', first_name: 'Harriet', last_name: 'Smith', email: 'harriet@example.com', intent_status: 'unknown', last_contacted_at: null },
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

  if (loading) return <div>Loading subscribers...</div>;

  // 1. Filter
  const filteredSubscribers = subscribers.filter(sub => {
    if (filter === 'all') return true;
    return sub.intent_status === filter;
  });

  // 2. Sort
  const sortedSubscribers = [...filteredSubscribers].sort((a, b) => {
    // Handle nulls (e.g. last_contacted_at being null)
    if (!a[sortConfig.key]) return 1;
    if (!b[sortConfig.key]) return -1;
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)' }}>Subscribers</h1>
        <button className="btn btn-primary">+ Add Subscriber</button>
      </div>
      
      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Filter by Stage:</strong>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '200px', padding: '0.4rem' }}
          >
            <option value="all">All Subscribers</option>
            <option value="unknown">Unknown / General</option>
            <option value="warm">Warm</option>
            <option value="curious">Curious</option>
            <option value="active">Active Inquiry</option>
            <option value="invited">Invited</option>
            <option value="booked">Booked</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg-subtle)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
              <th onClick={() => requestSort('first_name')} style={{ padding: '0.5rem 1rem', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.85rem', cursor: 'pointer', width: '30%' }}>
                Name{getSortIndicator('first_name')}
              </th>
              <th onClick={() => requestSort('intent_status')} style={{ padding: '0.5rem 1rem', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.85rem', cursor: 'pointer', width: '15%' }}>
                Status{getSortIndicator('intent_status')}
              </th>
              <th onClick={() => requestSort('last_contacted_at')} style={{ padding: '0.5rem 1rem', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.85rem', cursor: 'pointer', width: '25%' }}>
                Last Contact{getSortIndicator('last_contacted_at')}
              </th>
              <th onClick={() => requestSort('email')} style={{ padding: '0.5rem 1rem', fontWeight: 500, color: 'var(--color-text-muted)', fontSize: '0.85rem', cursor: 'pointer', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Email{getSortIndicator('email')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSubscribers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
                  No subscribers found for this filter.
                </td>
              </tr>
            ) : (
              sortedSubscribers.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <Link to={`/subscribers/${sub.id}`} style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                      {sub.first_name} {sub.last_name}
                    </Link>
                  </td>
                  <td style={{ padding: '0.6rem 1rem' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '8px', 
                      backgroundColor: 'var(--color-bg-subtle)',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-main)'
                    }}>
                      {sub.intent_status}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                    {sub.last_contacted_at ? new Date(sub.last_contacted_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
