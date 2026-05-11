export const INTENT_STATUSES = {
  UNKNOWN: 'unknown',
  WARM: 'warm',
  CURIOUS: 'curious',
  ACTIVE: 'active',
  INVITED: 'invited',
  BOOKED: 'booked',
  INACTIVE: 'inactive'
};

export const SIGNAL_TYPES = {
  REPLIED_WITH_INTEREST: 'replied_with_interest',
  ASKED_FOR_PRICING: 'asked_for_pricing',
  ASKED_FOR_DATES: 'asked_for_dates',
  ASKED_WHICH_RETREAT: 'asked_which_retreat',
  INTERESTED_LATER: 'interested_later',
  NOT_INTERESTED_NOW: 'not_interested_now',
  NO_RESPONSE: 'no_response'
};

/**
 * Derives the next suggested action and intent status based on a logged signal.
 * This is the core "Intent Discovery" engine.
 */
export const calculateNextState = (currentStatus, signalType) => {
  const now = new Date();
  let nextAction = '';
  let nextDueDate = null;
  let newStatus = currentStatus;
  
  // By default, suggest attending to it today.
  nextDueDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // Tomorrow

  switch (signalType) {
    case SIGNAL_TYPES.REPLIED_WITH_INTEREST:
      newStatus = INTENT_STATUSES.WARM;
      nextAction = "Send 'Personal Connection' template to build relationship.";
      break;
      
    case SIGNAL_TYPES.ASKED_FOR_PRICING:
      newStatus = INTENT_STATUSES.ACTIVE;
      nextAction = "Send 'Pricing & Details' template.";
      break;
      
    case SIGNAL_TYPES.ASKED_FOR_DATES:
      newStatus = INTENT_STATUSES.ACTIVE;
      nextAction = "Send 'Availability / Calendar' template.";
      break;
      
    case SIGNAL_TYPES.ASKED_WHICH_RETREAT:
      newStatus = INTENT_STATUSES.CURIOUS; // or ACTIVE
      nextAction = "Send 'Which Retreat is right for me?' template.";
      break;
      
    case SIGNAL_TYPES.INTERESTED_LATER:
      newStatus = INTENT_STATUSES.INACTIVE;
      nextAction = "Check back in 3 months.";
      // Set due date to 90 days from now
      nextDueDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      break;
      
    case SIGNAL_TYPES.NOT_INTERESTED_NOW:
      newStatus = INTENT_STATUSES.INACTIVE;
      nextAction = "Keep on general newsletter. No specific retreat follow-up needed.";
      nextDueDate = null; // No action due
      break;
      
    case SIGNAL_TYPES.NO_RESPONSE:
      // If they haven't responded, just nudge them.
      nextAction = "Send 'Gentle Re-engagement' template.";
      nextDueDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days
      break;
      
    default:
      nextAction = "Review and determine next step manually.";
      break;
  }

  return {
    intent_status: newStatus,
    next_suggested_action: nextAction,
    next_action_due_date: nextDueDate ? nextDueDate.toISOString() : null,
    last_signal_type: signalType
  };
};
