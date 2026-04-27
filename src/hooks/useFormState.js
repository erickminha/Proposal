import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para gerenciar estado de formulários com auto-save e debounce.
 * @param {Object} initialData - Dados iniciais do formulário.
 * @param {Function} onSave - Função de salvamento (async).
 * @param {number} debounceTime - Tempo de espera para o auto-save (default 2000ms).
 */
export function useFormState(initialData, onSave, debounceTime = 2000) {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const timeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  const handleSave = useCallback(async (formData, isAutoSave = true) => {
    setSaving(true);
    setSaveMsg(isAutoSave ? 'Salvando automaticamente...' : 'Salvando...');
    try {
      await onSave(formData, isAutoSave);
      setSaveMsg('✅ Salvo com sucesso!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveMsg('❌ Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  }, [onSave]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      handleSave(data, true);
    }, debounceTime);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, debounceTime, handleSave]);

  const setField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const setFields = (fields) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const handleSaveManual = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    handleSave(data, false);
  };

  const reset = (newData) => {
    setData(newData || initialData);
    setSaveMsg('');
  };

  return {
    data,
    setData,
    setField,
    setFields,
    saving,
    saveMsg,
    handleSaveManual,
    reset
  };
}
