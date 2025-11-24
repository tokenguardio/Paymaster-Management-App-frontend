import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EChart } from '@/components';
import { usePolicyData } from '@/hooks/usePolicyData';
import { usePolicyRules } from '@/hooks/usePolicyRules';
import {
  getComparatorSymbol,
  shortenAddress,
  getAreaChartOption,
  toDateOnly,
  isDateInRange,
  todayISO,
} from '@/utils/helpers';
import { NoDataInfoBox } from './NoDataInfoBox';
import Style from './PaymasterView.module.css';
import { ResultingTable } from './ResultingTable';

export const PaymasterView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) navigate('/paymaster');
  }, [id, navigate]);

  const { policyData } = usePolicyData(id || '');
  const { policyRules } = usePolicyRules(id ?? '', '');

  if (!id) return null;

  if (!policyData) return <NoDataInfoBox />;

  const processedRules = (policyRules || []).map((rule) => {
    const from = toDateOnly(rule.valid_from);
    const to = rule.valid_to ? toDateOnly(rule.valid_to) : todayISO;

    const INTERVAL = rule.interval?.name?.toUpperCase() ?? '';
    const METRIC = rule.metric?.name?.toUpperCase() ?? '';
    const SCOPE = rule.scope?.name?.toUpperCase() ?? '';
    const TOKEN = rule.token_address ? shortenAddress(rule.token_address) : '';
    const COMP = getComparatorSymbol(rule.comparator.name);
    const VALUE = rule.value;

    return {
      id: rule.id,
      from,
      to,
      desc: `${INTERVAL} ${METRIC} ${SCOPE} ${TOKEN} ${COMP} ${VALUE}`,
    };
  });

  const dynamicMarkPoints = (policyRules || []).map((rule) => {
    const date = toDateOnly(rule.valid_from);

    return {
      name: rule.id,
      coord: [date, 0],
      symbol: 'pin',
      symbolSize: 30,
    };
  });

  const option = getAreaChartOption({
    title: {
      text: 'Number of UserOps',
      left: 'center',
    },
    data: policyData,
    toolbox: false,
    dataZoom: false,
    legend: false,
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const date = params[0].axisValue;
        const measureValue = params[0].value;
        const measureName = params[0].seriesName;
        const marker = params[0].marker;

        const matched = processedRules.filter((r) => isDateInRange(date, r.from, r.to));

        let html = `<div><strong>${date}</strong></div>`;
        html += `<div>${marker} ${measureName}: <b>${measureValue}</b></div>`;

        if (matched.length > 0) {
          html += `<div style="margin-top:4px;"><strong>Rules:</strong></div>`;
          matched.forEach((r) => {
            html += `<div><b>${r.desc}</b><br/> ${r.from} → ${r.to}</div>`;
          });
        } else {
          html += ``;
        }

        return html;
      },
    },
    markPoint: {
      data: dynamicMarkPoints,
    },
  });

  return (
    <section className={Style['preview-container']}>
      <EChart option={option} style={{ height: 600 }} />
      <ResultingTable data={policyData} />
    </section>
  );
};
