import React from 'react';
import { PaymasterEditSettings } from './components/PaymasterEditSettings';
import Style from './PolicyEdit.module.css';
import { PaymasterView } from '../common/components/PaymasterView';

export const PolicyEdit = () => {
  return (
    <div className={Style['policy-edit']}>
      <PaymasterEditSettings />
      <PaymasterView />
    </div>
  );
};
