import { supabase } from '../supabase';

export const supabaseService = {
  proposals: {
    async list(orgId, filters = {}) {
      let query = supabase
        .from('propostas')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      return { ok: !error, data, error: error?.message };
    },

    async get(id) {
      const { data, error } = await supabase
        .from('propostas')
        .select('*')
        .eq('id', id)
        .single();
      return { ok: !error, data, error: error?.message };
    },

    async create(proposalData) {
      const { data, error } = await supabase
        .from('propostas')
        .insert([proposalData])
        .select()
        .single();
      return { ok: !error, data, error: error?.message };
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('propostas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { ok: !error, data, error: error?.message };
    },

    async updateStatus(id, status) {
      const { error } = await supabase
        .from('propostas')
        .update({ status })
        .eq('id', id);
      return { ok: !error, error: error?.message };
    },

    async delete(id) {
      const { error } = await supabase
        .from('propostas')
        .delete()
        .eq('id', id);
      return { ok: !error, error: error?.message };
    }
  },

  candidateReports: {
    async list(orgId) {
      const { data, error } = await supabase
        .from('candidate_reports')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      return { ok: !error, data, error: error?.message };
    },

    async get(id) {
      const { data, error } = await supabase
        .from('candidate_reports')
        .select('*')
        .eq('id', id)
        .single();
      return { ok: !error, data, error: error?.message };
    },

    async create(reportData) {
      const { data, error } = await supabase
        .from('candidate_reports')
        .insert([reportData])
        .select()
        .single();
      return { ok: !error, data, error: error?.message };
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('candidate_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { ok: !error, data, error: error?.message };
    },

    async delete(id) {
      const { error } = await supabase
        .from('candidate_reports')
        .delete()
        .eq('id', id);
      return { ok: !error, error: error?.message };
    }
  },

  organizations: {
    async get(id) {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();
      return { ok: !error, data, error: error?.message };
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { ok: !error, data, error: error?.message };
    }
  },

  organizationMembers: {
    async invite({ organization_id, email, role }) {
      const { data, error } = await supabase.functions.invoke('invite_member', {
        body: { organization_id, email, role }
      });
      return { ok: !error, data, error: error?.message };
    },

    async changeRole({ organization_id, user_id, new_role }) {
      const { data, error } = await supabase.functions.invoke('change_member_role', {
        body: { organization_id, user_id, new_role }
      });
      return { ok: !error, data, error: error?.message };
    },

    async remove({ organization_id, user_id }) {
      const { data, error } = await supabase.functions.invoke('remove_member', {
        body: { organization_id, user_id }
      });
      return { ok: !error, data, error: error?.message };
    }
  }
};
