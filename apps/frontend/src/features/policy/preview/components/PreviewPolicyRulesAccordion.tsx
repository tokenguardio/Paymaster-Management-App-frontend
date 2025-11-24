import { POLICY_RULE_COMPARATOR } from '@repo/constants';
import React from 'react';
import { Accordion, Typography, TinySelect, DynamicInput } from '@/components';
import { TPolicyRules } from '@/types/policyRule';
import Style from './PreviewPolicyRulesAccordion.module.css';

type TPreviewPolicyRulesAccordionProps = {
  policyRules: TPolicyRules;
};

const comparatorNameToSymbolOption = Object.values(POLICY_RULE_COMPARATOR).map((comparator) => {
  let symbol = '';
  switch (comparator.name) {
    case 'Less Than or Equal':
      symbol = '<=';
      break;
    case 'Greater Than or Equal':
      symbol = '>=';
      break;
    case 'Equal':
      symbol = '=';
      break;
    case 'Less Than':
      symbol = '<';
      break;
    case 'Greater Than':
      symbol = '>';
      break;
  }
  return {
    label: symbol,
    value: comparator.name,
  };
});

function getComparatorSymbol(name: string) {
  switch (name) {
    case 'Less Than or Equal':
      return '<=';
    case 'Greater Than or Equal':
      return '>=';
    case 'Equal':
      return '=';
    case 'Less Than':
      return '<';
    case 'Greater Than':
      return '>';
    default:
      return '';
  }
}

export const PreviewPolicyRulesAccordion = ({ policyRules }: TPreviewPolicyRulesAccordionProps) => {
  if (!policyRules) return null;

  return (
    <Accordion defaultOpen title="Rules">
      {policyRules.length === 0 ? (
        <Typography
          tag="p"
          text="Policy doesn't have active rules."
          size="s"
          style="italic"
          weight="regular"
          align="center"
          className="mt24"
        />
      ) : (
        <ul className={Style['user-rule-list']}>
          {policyRules.map((rule, index) => (
            <li key={index} className={Style['user-rule-row']}>
              <TinySelect
                options={[{ label: rule.interval.name, value: rule.interval.name }]}
                change={() => {}}
                name={rule.interval.name}
                disabled
                withArrow={false}
                value={{ label: rule.interval.name, value: rule.interval.name }}
                isSearchable={false}
              />
              <TinySelect
                options={[{ label: rule.metric.name, value: rule.metric.name }]}
                change={() => {}}
                name={rule.metric.name}
                disabled
                withArrow={false}
                value={{ label: rule.metric.name, value: rule.metric.name }}
                isSearchable={false}
              />
              {rule?.scope && (
                <TinySelect
                  options={[{ label: rule.scope.name, value: rule.scope.name }]}
                  change={() => {}}
                  name={rule.scope.name}
                  disabled
                  withArrow={false}
                  value={{ label: rule.scope.name, value: rule.scope.name }}
                  isSearchable={false}
                />
              )}
              {rule?.token_address && (
                <DynamicInput
                  name={`rules.${index}.token_address`}
                  placeholder="Token Address"
                  className={Style['amount-input']}
                  value={rule.token_address}
                  size="xsmall"
                  disabled
                />
              )}
              <TinySelect
                options={comparatorNameToSymbolOption}
                change={() => {}}
                name={rule.comparator.name}
                disabled
                withArrow={false}
                value={{
                  label: getComparatorSymbol(rule.comparator.name),
                  value: rule.comparator.name,
                }}
                isSearchable={false}
              />
              <TinySelect
                options={[{ label: rule?.value, value: rule?.value }]}
                change={() => {}}
                name="value"
                disabled
                withArrow={false}
                value={{ label: rule?.value, value: rule?.value }}
                isSearchable={false}
              />
            </li>
          ))}
        </ul>
      )}
    </Accordion>
  );
};
