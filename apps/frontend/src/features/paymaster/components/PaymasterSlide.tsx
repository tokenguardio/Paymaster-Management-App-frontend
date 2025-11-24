import React from 'react';
import noDataChartInfo from '@/assets/images/no-data-chart.png';
import { EChart, Badge, Card, Dropdown, Icon, Typography, Loader } from '@/components';
import { usePolicyData } from '@/hooks/usePolicyData';
import { TDropdownOption } from '@/types/dropdownOption';
import { getAreaChartOption } from '@/utils/helpers';
import Style from './PaymasterSlide.module.css';

interface IPaymasterSlideProps {
  id: string;
  title: string;
  options: Array<TDropdownOption>;
}

export const PaymasterSlide: React.FC<IPaymasterSlideProps> = ({ id, title, options }) => {
  const { policyData, isLoadingPolicyData } = usePolicyData(id);

  const option = getAreaChartOption({
    data: policyData,
    toolbox: false,
    dataZoom: false,
    legend: false,
  });

  return (
    <section className={Style['paymaster-slide']}>
      <Card key={id}>
        <div className={Style['settings-bar']}>
          <Typography
            size="m"
            weight="medium"
            text={title}
            tag="p"
            color="primary500"
            align="left"
          />
          <Badge text="Active" status="active"></Badge>
          {options && options.length > 0 ? (
            <div className="relative">
              <Dropdown options={options} id={id} position="bottom">
                <Icon name="more" width={16} height={16} />
              </Dropdown>
            </div>
          ) : null}
        </div>
        {policyData && !isLoadingPolicyData && (
          <>
            <Typography
              size="xs"
              weight="regular"
              text="Number of UserOps"
              tag="p"
              color="primary500"
              align="center"
            />
            <EChart option={option} />
          </>
        )}
        {!policyData && !isLoadingPolicyData && (
          <img src={noDataChartInfo} height={300} alt="no chart data information" />
        )}
        {isLoadingPolicyData && (
          <div className="relative min-height">
            <Loader />
          </div>
        )}
      </Card>
    </section>
  );
};
