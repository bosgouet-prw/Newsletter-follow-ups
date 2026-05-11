import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SIGNAL_TYPES, INTENT_STATUSES, calculateNextState } from '../services/workflowLogic';
import LifecycleStepper from '../components/LifecycleStepper';

export default function SubscriberDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [subscriber, setSubscriber] = useState(null);
  const [eventLog, setEventLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      // Mock data
      setSubscriber({
        id, first_name: 'Emma', last_name: 'Woodhouse', email: 'emma@example.com',
        intent_status: 'warm', last_contacted_at: new Date(Date.now() - 1000000).toISOString(),
        next_suggested_action: 'Send Personal Connection template', next_action_due_date: new Date().toISOString()
      });
      setEventLog([
        { id: 'e1', type: 'note_added', content: 'Met at the farmers market.', created_at: new Date(Date.now() - 5000000).toISOString() },
        { id: 'e2', type: 'signal_captured', signal_type: 'replied_with_interest', created_at: new Date(Date.now() - 1000000).toISOString() }
      ]);
      setLoading(false);
      return;
    }

    if (user && id) {
      Promise.all([
        api.getSubscriberById(id),
        api.getEventLog(id)
      ]).then(([subData, logData]) => {
        setSubscriber(subData);
        setEventLog(logData);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id, user]);

  const handleLogSignal = async (signalType) => {
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const newState = calculateNextState(subscriber.intent_status, signalType);
      setSubscriber({ ...subscriber, ...newState });
      setEventLog([{ id: Date.now().toString(), type: 'signal_captured', signal_type: signalType, created_at: new Date().toISOString() }, ...eventLog]);
      return;
    }
    
    try {
      const newState = calculateNextState(subscriber.intent_status, signalType);
      
      const updatedSub = await api.updateSubscriber(subscriber.id, {
        intent_status: newState.intent_status,
        next_suggested_action: newState.next_suggested_action,
        next_action_due_date: newState.next_action_due_date,
        last_signal_type: newState.last_signal_type,
        last_contacted_at: new Date().toISOString()
      });
      
      const newEvent = await api.logEvent({
        owner_id: user.id,
        subscriber_id: subscriber.id,
        type: 'signal_captured',
        signal_type: signalType
      });
      
      setSubscriber(updatedSub);
      setEventLog([newEvent, ...eventLog]);
    } catch (err) {
      console.error(err);
      alert("Failed to log signal");
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setEventLog([{ id: Date.now().toString(), type: 'note_added', content: noteText, created_at: new Date().toISOString() }, ...eventLog]);
      setNoteText('');
      return;
    }

    try {
      const newEvent = await api.logEvent({
        owner_id: user.id,
        subscriber_id: subscriber.id,
        type: 'note_added',
        content: noteText
      });
      setEventLog([newEvent, ...eventLog]);
      setNoteText('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!subscriber) return <div>Subscriber not found.</div>;

  return (
    <div>
      <Link to="/subscribers" style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Back to List
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{subscriber.first_name} {subscriber.last_name}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{subscriber.email}</p>
        </div>
      </div>

      {/* Visual Breadcrumb Trail */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem 1.5rem', overflowX: 'auto' }}>
         <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Relationship Journey</h4>
         <LifecycleStepper currentStatus={subscriber.intent_status} />
      </div>

      <div className="grid-sidebar">
        
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: 'var(--color-bg-subtle)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Next Suggested Action</h3>
          <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>{subscriber.next_suggested_action || "No action currently suggested."}</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
             <button className="btn btn-primary">Draft Email</button>
             <button className="btn btn-secondary">Mark Done (Skip)</button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Log an Interaction (Signal)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            What just happened? Clicking a button below will update their status and suggest the next best step.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.entries(SIGNAL_TYPES).map(([key, value]) => (
              <button 
                key={value}
                onClick={() => handleLogSignal(value)}
                style={{ 
                  padding: '0.4rem 0.8rem', 
                  fontSize: '0.8rem', 
                  borderRadius: '20px', 
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-card)',
                  cursor: 'pointer'
                }}
              >
                {key.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Timeline & Details */}
      <div>
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
           <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Current Status</h4>
           <div style={{ fontWeight: 'bold', color: 'var(--color-accent-secondary)', textTransform: 'uppercase' }}>
             {subscriber.intent_status}
           </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Timeline</h3>
          
          <form onSubmit={handleAddNote} style={{ marginBottom: '1.5rem' }}>
            <textarea 
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a private note..." 
              style={{ minHeight: '80px', marginBottom: '0.5rem' }}
            />
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>Save Note</button>
          </form>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {eventLog.map(event => (
              <div key={event.id} style={{ fontSize: '0.85rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-light)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
                <strong style={{ display: 'block', color: 'var(--color-text-main)' }}>
                  {event.type.replace('_', ' ')}
                </strong>
                {event.signal_type && <span style={{ color: 'var(--color-accent-primary)' }}>{event.signal_type.replace(/_/g, ' ')}</span>}
                {event.content && <p style={{ marginTop: '0.25rem' }}>{event.content}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
