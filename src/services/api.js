import { supabase } from '../lib/supabase';

export const api = {
  // Profiles
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    return data;
  },

  // Subscribers
  async getSubscribers() {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*, retreats(title)')
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },
  
  async getSubscriberById(id) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*, retreats(title)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },

  async createSubscriber(subscriberData) {
    const { data, error } = await supabase
      .from('subscribers')
      .insert(subscriberData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateSubscriber(id, updates) {
    const { data, error } = await supabase
      .from('subscribers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  // Event Log
  async getEventLog(subscriberId) {
    const { data, error } = await supabase
      .from('event_log')
      .select('*, templates(name, subject)')
      .eq('subscriber_id', subscriberId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  async logEvent(eventData) {
    const { data, error } = await supabase
      .from('event_log')
      .insert(eventData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  // Templates
  async getTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*, retreats(title)')
      .order('name', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  // Retreats
  async getRetreats() {
    const { data, error } = await supabase
      .from('retreats')
      .select('*')
      .order('start_date', { ascending: true });
      
    if (error) throw error;
    return data;
  }
};
