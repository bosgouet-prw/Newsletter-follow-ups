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
      .neq('intent_status', 'backlog')
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

  // --- Backlog & Import ---

  async importSubscribers(subscribers) {
    const { data, error } = await supabase
      .from('subscribers')
      .upsert(subscribers, { onConflict: 'owner_id,email', ignoreDuplicates: true })
      .select();
    if (error) throw error;
    return data;
  },

  async getBacklogCount() {
    const { count, error } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('intent_status', 'backlog');
    if (error) throw error;
    return count;
  },

  async clearBacklog() {
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('intent_status', 'backlog');
    if (error) throw error;
  },

  async clearDashboard() {
    // Wipe event logs for dashboard leads first to satisfy foreign key constraints
    const { data: dashboardSubs } = await supabase
      .from('subscribers')
      .select('id')
      .neq('intent_status', 'backlog');
      
    if (dashboardSubs && dashboardSubs.length > 0) {
      const ids = dashboardSubs.map(s => s.id);
      await supabase.from('event_log').delete().in('subscriber_id', ids);
    }
    
    // Wipe dashboard leads
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .neq('intent_status', 'backlog');
    if (error) throw error;
  },

  async activateBacklog(limit = 10) {
    const { data: subs, error: fetchError } = await supabase
      .from('subscribers')
      .select('id')
      .eq('intent_status', 'backlog')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (fetchError) throw fetchError;
    if (!subs || subs.length === 0) return 0;
    
    const ids = subs.map(s => s.id);
    
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ 
        intent_status: 'unknown',
        next_suggested_action: 'Send Initial Warm-Up Email',
        next_action_due_date: new Date().toISOString()
      })
      .in('id', ids);
      
    if (updateError) throw updateError;
    return ids.length;
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
