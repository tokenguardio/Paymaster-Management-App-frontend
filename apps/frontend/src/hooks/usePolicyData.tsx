/***
 *
 *   usePolicyData hook
 *   fetch, format and return policy data for chart displaying
 *
 **********/

import { useEffect, useState } from 'react';
import { TChartDataPoint } from '@/types/chart';
import { _PolicyDataSchema } from '@/types/policyData';
import { fetchPolicyData } from '@/utils/fetches';
import { _getValidationErrorMessage } from '@/utils/helpers';
import { _logger } from '@/utils/logger';

export const usePolicyData = (id: string) => {
  const [policyData, setPolicyData] = useState<Array<TChartDataPoint>>();
  const [isLoadingPolicyData, setIsLoadingPolicyData] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingPolicyData(true);

        const fetchedPolicyData = await fetchPolicyData(id);
        // const validatedPolicyData = PolicyDataSchema.safeParse(fetchedPolicyData);
        //TODO inprogress
        // if (!validatedPoliciesData.success) {
        //   logger.error(validatedPoliciesData.error);
        //   throw Error(getValidationErrorMessage('Policies data'));
        // }
        // setPolicies(validatedPoliciesData.data);
        setPolicyData(fetchedPolicyData);
        setIsLoadingPolicyData(false);
      } catch (err: unknown) {
        setIsLoadingPolicyData(false);
        console.log('err', err);
      }
    };

    fetchData();
  }, [id]);

  return {
    policyData,
    isLoadingPolicyData,
  };
};
