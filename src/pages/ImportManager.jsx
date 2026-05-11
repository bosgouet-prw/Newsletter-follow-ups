import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ImportManager() {
  const { user } = useAuth();
  const [backlogCount, setBacklogCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (import.meta.env.VITE_SUPABASE_URL !== undefined && user) {
      fetchBacklogCount();
    } else if (import.meta.env.VITE_SUPABASE_URL === undefined) {
       setBacklogCount(1432); // Mock
    }
  }, [user]);

  const fetchBacklogCount = async () => {
    try {
      const count = await api.getBacklogCount();
      setBacklogCount(count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const rows = csvText.split('\n').filter(row => row.trim().length > 0);
      
      // Assume CSV format: First Name, Last Name, Email
      // Skip header row if it exists
      let startIndex = 0;
      if (rows[0].toLowerCase().includes('email')) startIndex = 1;

      const subscribers = [];
      for (let i = startIndex; i < rows.length; i++) {
        // Handle basic comma separation (ignoring quotes for simplicity in V1)
        const columns = rows[i].split(',');
        if (columns.length >= 3) {
          const email = columns[2].trim();
          if (email && email.includes('@')) {
            subscribers.push({
              owner_id: user?.id || 'mock',
              first_name: columns[0].trim(),
              last_name: columns[1].trim(),
              email: email,
              intent_status: 'backlog',
              source: 'csv_import'
            });
          }
        }
      }

      if (import.meta.env.VITE_SUPABASE_URL === undefined) {
        setBacklogCount(backlogCount + subscribers.length);
        setMessage(`Mock Import: Successfully added ${subscribers.length} subscribers to backlog.`);
        setUploading(false);
        return;
      }

      if (subscribers.length > 0) {
        try {
          await api.importSubscribers(subscribers);
          setMessage(`Successfully imported ${subscribers.length} subscribers into the backlog.`);
          fetchBacklogCount();
        } catch (err) {
          console.error(err);
          setMessage("Failed to import. Check console for details.");
        }
      } else {
        setMessage("No valid email addresses found in the CSV.");
      }
      setUploading(false);
    };
    reader.onerror = () => {
      setMessage("Failed to read file.");
      setUploading(false);
    };
    reader.readAsText(file);
  };

  const handleActivate = async (amount) => {
    setActivating(true);
    setMessage('');
    
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const activated = Math.min(amount, backlogCount);
      setBacklogCount(backlogCount - activated);
      setMessage(`Mock Activate: Moved ${activated} subscribers into the active pipeline.`);
      setActivating(false);
      return;
    }

    try {
      const activatedCount = await api.activateBacklog(amount);
      setMessage(`Successfully moved ${activatedCount} subscribers into the active pipeline.`);
      fetchBacklogCount();
    } catch (err) {
      console.error(err);
      setMessage("Failed to activate batch.");
    }
    setActivating(false);
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)', marginBottom: '2rem' }}>
        Database & Imports
      </h1>

      <div className="grid-2">
        {/* CSV Import */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Historical CSV</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Upload your old subscribers. They will be placed in the "Backlog" so they don't overwhelm your active dashboard.
          </p>
          
          <div style={{ padding: '1.5rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-main)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Format required: <br/><strong>First Name, Last Name, Email</strong>
            </p>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ maxWidth: '250px', cursor: 'pointer' }}
            />
            {uploading && <p style={{ marginTop: '1rem', color: 'var(--color-accent-secondary)' }}>Processing file...</p>}
          </div>
        </div>

        {/* Backlog Batcher */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>The Backlog Batcher</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Control the flow of old leads into your daily workflow.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)', lineHeight: 1 }}>
              {backlogCount}
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
              Waiting in Backlog
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => handleActivate(10)}
                disabled={activating || backlogCount === 0}
              >
                Activate 10
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleActivate(20)}
                disabled={activating || backlogCount === 0}
              >
                Activate 20
              </button>
            </div>
            {activating && <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Activating...</p>}
          </div>
        </div>
      </div>

      {message && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-accent-secondary)', fontWeight: 500 }}>
          {message}
        </div>
      )}
    </div>
  );
}
