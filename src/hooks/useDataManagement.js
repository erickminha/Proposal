import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../services/supabaseService';

export function useProposalList(organizationId) {
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProposals = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const { ok, data, error } = await supabaseService.proposals.list(organizationId);
    if (ok) {
      setPropostas(data);
    } else {
      setError(error);
    }
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const deleteProposal = async (id) => {
    const { ok, error } = await supabaseService.proposals.delete(id);
    if (ok) {
      setPropostas(prev => prev.filter(p => p.id !== id));
      return { ok: true };
    }
    return { ok: false, error };
  };

  const getStatusSummary = () => {
    return propostas.reduce((acc, p) => {
      const status = p.status || 'Rascunho';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  };

  const filteredProposals = propostas.filter(p => 
    p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dados?.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    propostas: filteredProposals,
    allPropostas: propostas,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    deleteProposal,
    getStatusSummary,
    refresh: fetchProposals,
    total: propostas.length
  };
}

export function useCandidateReportList(organizationId) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const { ok, data, error } = await supabaseService.candidateReports.list(organizationId);
    if (ok) {
      setReports(data);
    } else {
      setError(error);
    }
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    refresh: fetchReports
  };
}
