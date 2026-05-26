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
      
      let startIndex = 0;
      if (rows[0].toLowerCase().includes('email') || rows[0].toLowerCase().includes('timestamp')) {
        startIndex = 1;
      }

      const subscribers = [];
      for (let i = startIndex; i < rows.length; i++) {
        // Handle basic comma separation (ignoring quotes for simplicity in V1)
        const columns = rows[i].split(',').map(c => c.trim());
        if (columns.length >= 1) {
          
          let email = '';
          let firstName = '';
          let lastName = '';
          let createdAtStr = null;

          // If it's 1 column, it must be the email
          if (columns.length === 1) {
            email = columns[0];
          }
          // If it's a 2-column CSV, it's likely [Timestamp, Email] or [Email, Timestamp]
          else if (columns.length === 2) {
            if (columns[0].includes('@')) {
              email = columns[0];
              createdAtStr = columns[1];
            } else {
              email = columns[1];
              createdAtStr = columns[0];
            }
          } 
          // If it's 3+ columns, find the email and guess the rest
          else {
            const emailIndex = columns.findIndex(col => col.includes('@'));
            if (emailIndex !== -1) {
              email = columns[emailIndex];
              // Very basic heuristic for first/last name if email is index 2
              if (emailIndex === 2) {
                firstName = columns[0];
                lastName = columns[1];
              }
            }
          }

          if (email && email.includes('@')) {
            const payload = {
              owner_id: user?.id || 'mock',
              first_name: firstName,
              last_name: lastName,
              email: email,
              intent_status: 'backlog',
              source: 'csv_import'
            };

            // Parse the timestamp if we found one
            if (createdAtStr) {
              let parsedDate = new Date(createdAtStr);
              if (isNaN(parsedDate.getTime())) {
                // Try European DD/MM/YYYY
                const parts = createdAtStr.split(/[ \/:-]/);
                if (parts.length >= 3) {
                  parsedDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]} ${parts[3] || '00'}:${parts[4] || '00'}`);
                }
              }
              if (!isNaN(parsedDate.getTime())) {
                payload.created_at = parsedDate.toISOString();
              } else {
                // Fallback: Use current time + offset to preserve CSV row order
                payload.created_at = new Date(Date.now() + (i * 1000)).toISOString();
              }
            } else {
              // Fallback: Use current time + offset to preserve CSV row order
              payload.created_at = new Date(Date.now() + (i * 1000)).toISOString();
            }
            
            subscribers.push(payload);
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

  const handleClearBacklog = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all leads currently waiting in the backlog? This will NOT delete leads on your dashboard.")) {
      return;
    }
    setActivating(true);
    try {
      await api.clearBacklog();
      setMessage("Successfully cleared the backlog.");
      fetchBacklogCount();
    } catch (err) {
      console.error(err);
      setMessage("Failed to clear backlog.");
    }
    setActivating(false);
  };

  const handleActivate = async (amount) => {
    if (backlogCount === 0) {
      alert("There are 0 leads in the backlog! This means you either haven't imported a CSV yet, or your CSV import failed.");
      return;
    }
    if (activating) return;

    setActivating(true);
    setMessage('');
    
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const activated = Math.min(amount, backlogCount);
      setBacklogCount(backlogCount - activated);
      setMessage(`Mock Activate: Moved ${activated} subscribers into the active pipeline.`);
      alert(`Moved ${activated} subscribers to your Dashboard!`);
      setActivating(false);
      return;
    }

    try {
      const activatedCount = await api.activateBacklog(amount);
      setMessage(`Successfully moved ${activatedCount} subscribers into the active pipeline.`);
      if (activatedCount > 0) {
        alert(`${activatedCount} leads have been activated and sent to the bottom of your Dashboard's 'Requires Attention' list!`);
      }
      fetchBacklogCount();
    } catch (err) {
      console.error(err);
      setMessage("Failed to activate batch: " + err.message);
      alert("Failed to activate batch: " + err.message);
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
              Format required: <br/><strong>Email (Name and Date/Time are optional)</strong>
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

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => handleActivate(10)}
              >
                Activate 10
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleActivate(20)}
              >
                Activate 20
              </button>
            </div>
            {activating && <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Activating...</p>}

            <button 
                style={{ 
                  marginTop: '1rem', 
                  backgroundColor: 'transparent', 
                  border: '1px solid #ef4444', 
                  color: '#ef4444', 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
                onClick={handleClearBacklog}
                disabled={activating || backlogCount === 0}
              >
                Clear Backlog (Undo Import)
            </button>
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
