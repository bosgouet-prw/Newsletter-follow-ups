-- Create enums
CREATE TYPE intent_status AS ENUM ('unknown', 'warm', 'curious', 'active', 'invited', 'booked', 'inactive');
CREATE TYPE retreat_status AS ENUM ('upcoming', 'active', 'archived');
CREATE TYPE template_category AS ENUM ('relationship', 'pricing', 'dates', 'faq', 're_engagement', 'booking');
CREATE TYPE signal_type AS ENUM ('replied_with_interest', 'asked_for_pricing', 'asked_for_dates', 'asked_which_retreat', 'interested_later', 'not_interested_now', 'no_response');
CREATE TYPE event_type AS ENUM ('email_sent', 'signal_captured', 'note_added', 'stage_changed', 'retreat_assigned');

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Retreats
CREATE TABLE retreats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  status retreat_status DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE retreats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own retreats" ON retreats FOR ALL USING (auth.uid() = owner_id);

-- Subscribers
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  intent_status intent_status DEFAULT 'unknown',
  interested_retreat_id UUID REFERENCES retreats(id),
  last_signal_type signal_type,
  last_contacted_at TIMESTAMPTZ,
  next_suggested_action TEXT,
  next_action_due_date TIMESTAMPTZ,
  is_unsubscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, email)
);
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own subscribers" ON subscribers FOR ALL USING (auth.uid() = owner_id);

-- Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  retreat_id UUID REFERENCES retreats(id),
  category template_category,
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own templates" ON templates FOR ALL USING (auth.uid() = owner_id);

-- Event Log
CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  subscriber_id UUID REFERENCES subscribers(id) NOT NULL,
  type event_type NOT NULL,
  signal_type signal_type,
  template_id UUID REFERENCES templates(id),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own event log" ON event_log FOR ALL USING (auth.uid() = owner_id);
