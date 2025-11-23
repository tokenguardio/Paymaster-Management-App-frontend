/***
 *
 *   usePolicies hook
 *   fetch, format and return policies
 *
 **********/

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { fetchPolicies } from '../utils/fetches';

export const usePolicies = () => {
  const [policies, setPolicies] = useState();
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingPolicies(true);

      const fetchedPolicies = await fetchPolicies('?status=ACTIVE');
      setPolicies(fetchedPolicies);
    } catch (err: unknown) {
      toast.error(err?.toString());
    } finally {
      setIsLoadingPolicies(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    policies,
    isLoadingPolicies,
    refreshData: fetchData,
  };
};
