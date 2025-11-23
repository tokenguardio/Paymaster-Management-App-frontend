/***
 *
 *   usePolicy hook
 *   fetch, format and return policy
 *
 **********/

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { TPolicy } from '@/types/policy';
import { fetchPolicy } from '@/utils/fetches';

export const usePolicy = (id: string) => {
  const [policy, setPolicy] = useState<TPolicy>();
  const [isLoadingPolicy, setIsLoadingPolicy] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingPolicy(true);
      const fetchedPolicy = await fetchPolicy(id);
      setPolicy(fetchedPolicy);
    } catch (err: unknown) {
      toast.error(err?.toString());
    } finally {
      setIsLoadingPolicy(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    policy,
    isLoadingPolicy,
    refreshData: fetchData,
  };
};
