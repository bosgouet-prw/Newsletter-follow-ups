import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TemplatesManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setTemplates([
        { id: '1', name: '01 - Warm Connection', category: 'relationship', subject: 'Checking in', body: 'Hi {{first_name}},\n\nI noticed you reading our recent newsletters and just wanted to reach out personally to say hello.\n\nWarmly,' },
        { id: '2', name: '02 - Which Retreat?', category: 'faq', subject: 'Finding the right fit', body: 'Hi {{first_name}},\n\nI saw you were curious about the retreats. Which one are you feeling drawn to right now?' },
      ]);
      setLoading(false);
      return;
    }

    if (user) {
      api.getTemplates()
        .then(data => {
          setTemplates(data);
          if (data.length > 0) setSelectedTemplate(data[0]);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div>Loading templates...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)' }}>Email Templates</h1>
        <button className="btn btn-primary">+ New Template</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Sidebar */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
             <h3 style={{ fontSize: '1rem' }}>Library</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {templates.map(tmpl => (
              <li 
                key={tmpl.id} 
                onClick={() => setSelectedTemplate(tmpl)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--color-border)', 
                  cursor: 'pointer',
                  backgroundColor: selectedTemplate?.id === tmpl.id ? 'var(--color-bg-main)' : 'transparent',
                  borderLeft: selectedTemplate?.id === tmpl.id ? '4px solid var(--color-accent-primary)' : '4px solid transparent'
                }}
              >
                <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{tmpl.name}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>{tmpl.category}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Editor */}
        {selectedTemplate ? (
          <div className="card">
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Template Name</label>
              <input type="text" value={selectedTemplate.name} readOnly style={{ marginBottom: '1rem' }} />
              
              <label>Subject Line</label>
              <input type="text" value={selectedTemplate.subject} readOnly style={{ marginBottom: '1rem' }} />
              
              <label>Email Body (Supports {'{{first_name}}'})</label>
              <textarea 
                value={selectedTemplate.body} 
                readOnly
                style={{ height: '300px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button className="btn btn-secondary">Edit Template</button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>
            Select a template from the library to view it.
          </div>
        )}
      </div>
    </div>
  );
}
