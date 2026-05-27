import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TemplatesManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [saving, setSaving] = useState(false);

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

  const handleNewClick = () => {
    setSelectedTemplate(null);
    setEditedTemplate({ name: '', subject: '', body: '', category: 'relationship' });
    setIsEditing(true);
  };

  const handleEditClick = () => {
    setEditedTemplate({ ...selectedTemplate });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTemplate(null);
    if (!selectedTemplate && templates.length > 0) {
      setSelectedTemplate(templates[0]);
    }
  };

  const handleSaveTemplate = async () => {
    if (!editedTemplate.name || !editedTemplate.subject || !editedTemplate.body) {
      alert("All fields are required.");
      return;
    }
    setSaving(true);
    
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      // Mock save
      if (editedTemplate.id) {
        setTemplates(templates.map(t => t.id === editedTemplate.id ? editedTemplate : t));
      } else {
        const newT = { ...editedTemplate, id: Date.now().toString() };
        setTemplates([...templates, newT]);
        setSelectedTemplate(newT);
      }
      setIsEditing(false);
      setSaving(false);
      return;
    }
    
    try {
      if (editedTemplate.id) {
        const updated = await api.updateTemplate(editedTemplate.id, {
          name: editedTemplate.name,
          subject: editedTemplate.subject,
          body: editedTemplate.body
        });
        setTemplates(templates.map(t => t.id === updated.id ? updated : t));
        setSelectedTemplate(updated);
      } else {
        const created = await api.createTemplate({
          name: editedTemplate.name,
          subject: editedTemplate.subject,
          body: editedTemplate.body,
          category: 'relationship',
          owner_id: user.id
        });
        setTemplates([...templates, created]);
        setSelectedTemplate(created);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save template");
    }
    setSaving(false);
  };

  if (loading) return <div>Loading templates...</div>;

  const currentViewTemplate = isEditing ? editedTemplate : selectedTemplate;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)' }}>Email Templates</h1>
        <button className="btn btn-primary" onClick={handleNewClick} disabled={isEditing}>+ New Template</button>
      </div>
      
      <div className="grid-sidebar-left">
        {/* Sidebar */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
             <h3 style={{ fontSize: '1rem' }}>Library</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {templates.map(tmpl => (
              <li 
                key={tmpl.id} 
                onClick={() => {
                  if (!isEditing) setSelectedTemplate(tmpl);
                }}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--color-border)', 
                  cursor: isEditing ? 'not-allowed' : 'pointer',
                  backgroundColor: selectedTemplate?.id === tmpl.id ? 'var(--color-bg-main)' : 'transparent',
                  borderLeft: selectedTemplate?.id === tmpl.id ? '4px solid var(--color-accent-primary)' : '4px solid transparent',
                  opacity: isEditing && selectedTemplate?.id !== tmpl.id ? 0.5 : 1
                }}
              >
                <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{tmpl.name}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>{tmpl.category}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Editor */}
        {currentViewTemplate ? (
          <div className="card">
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Template Name</label>
              <input 
                type="text" 
                value={currentViewTemplate.name} 
                readOnly={!isEditing} 
                onChange={(e) => isEditing && setEditedTemplate({...editedTemplate, name: e.target.value})}
                style={{ marginBottom: '1rem', backgroundColor: isEditing ? 'var(--color-bg-main)' : 'var(--color-bg-subtle)' }} 
              />
              
              <label>Subject Line</label>
              <input 
                type="text" 
                value={currentViewTemplate.subject || ''} 
                readOnly={!isEditing} 
                onChange={(e) => isEditing && setEditedTemplate({...editedTemplate, subject: e.target.value})}
                style={{ marginBottom: '1rem', backgroundColor: isEditing ? 'var(--color-bg-main)' : 'var(--color-bg-subtle)' }} 
              />
              
              <label>Email Body (Supports {'{{first_name}}'})</label>
              <textarea 
                value={currentViewTemplate.body || ''} 
                readOnly={!isEditing}
                onChange={(e) => isEditing && setEditedTemplate({...editedTemplate, body: e.target.value})}
                style={{ height: '300px', resize: 'vertical', backgroundColor: isEditing ? 'var(--color-bg-main)' : 'var(--color-bg-subtle)' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {isEditing ? (
                <>
                  <button className="btn btn-primary" onClick={handleSaveTemplate} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancelEdit} disabled={saving}>Cancel</button>
                </>
              ) : (
                <button className="btn btn-secondary" onClick={handleEditClick}>Edit Template</button>
              )}
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
