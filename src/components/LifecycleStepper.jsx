import React from 'react';
import { INTENT_STATUSES } from '../services/workflowLogic';

const STAGES = [
  { id: INTENT_STATUSES.UNKNOWN, label: 'New / General' },
  { id: INTENT_STATUSES.WARM, label: 'Warm' },
  { id: INTENT_STATUSES.CURIOUS, label: 'Curious' },
  { id: INTENT_STATUSES.ACTIVE, label: 'Active Inquiry' },
  { id: INTENT_STATUSES.INVITED, label: 'Invited' },
  { id: INTENT_STATUSES.BOOKED, label: 'Booked' }
];

export default function LifecycleStepper({ currentStatus }) {
  // If inactive, we still want to show where they fell off, but for V1 we just match current
  let currentIndex = STAGES.findIndex(s => s.id === currentStatus);
  if (currentIndex === -1) currentIndex = 0; // Default to start if unknown/inactive

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '4rem', marginTop: '1rem' }}>
      {STAGES.map((stage, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <React.Fragment key={stage.id}>
            {/* Step Node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: isPast ? 'var(--color-accent-primary)' : isCurrent ? 'var(--color-bg-main)' : 'var(--color-bg-card)',
                border: isCurrent ? '3px solid var(--color-accent-primary)' : isPast ? 'none' : '2px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isPast ? 'white' : 'transparent',
                zIndex: 2,
                boxShadow: isCurrent ? 'var(--shadow-soft)' : 'none'
              }}>
                {isPast && <span style={{ fontSize: '14px', lineHeight: 1 }}>✓</span>}
                {isCurrent && <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-accent-primary)', borderRadius: '50%' }} />}
              </div>
              <span style={{ 
                position: 'absolute', top: '35px', whiteSpace: 'nowrap', fontSize: '0.8rem',
                fontWeight: isCurrent ? 600 : 400,
                color: isCurrent || isPast ? 'var(--color-text-main)' : 'var(--color-text-light)'
              }}>
                {stage.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < STAGES.length - 1 && (
              <div style={{
                flex: 1, height: '2px',
                backgroundColor: index < currentIndex ? 'var(--color-accent-primary)' : 'var(--color-border)',
                margin: '0 8px',
                zIndex: 1,
                transform: 'translateY(-14px)' // Half the height of the node
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
