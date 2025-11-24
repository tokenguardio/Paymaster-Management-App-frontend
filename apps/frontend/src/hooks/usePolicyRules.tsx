/***
 *
 *   usePolicyRules hook
 *   fetch, format and return policy rules
 *
 **********/

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { TPolicyRules } from '@/types/policyRule';
import { fetchPolicyRules } from '@/utils/fetches';

export const usePolicyRules = (id: string, param: string) => {
  const [policyRules, setPolicyRules] = useState<TPolicyRules>();
  const [isLoadingPolicyRules, setIsLoadingPolicyRules] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingPolicyRules(true);
      const fetchedPolicyRules = await fetchPolicyRules(id, param);
      setPolicyRules(fetchedPolicyRules);
    } catch (err: unknown) {
      toast.error(err?.toString());
    } finally {
      setIsLoadingPolicyRules(false);
    }
  }, [id, param]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    policyRules,
    isLoadingPolicyRules,
    refreshData: fetchData,
  };
};
