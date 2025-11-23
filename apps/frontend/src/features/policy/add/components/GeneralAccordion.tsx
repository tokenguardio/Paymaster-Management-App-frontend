import React, { useState } from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Accordion, Checkbox, DatePicker, Icon, TextInput, Select } from '@/components';
import { blockchainsOptions } from '@/utils/constans';
import Style from './GeneralAccordion.module.css';

type TFormValues = {
  max_budget_wei?: string;
  chain_id?: string;
  valid_from?: Date;
  valid_to?: Date | null;
};

type TGeneralAccordionProps = {
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues>;
  setValue: (name: keyof TFormValues, value: unknown) => void;
};

export const GeneralAccordion = ({ control, errors, setValue }: TGeneralAccordionProps) => {
  const [policyNotExpired, setPolicyNotExpired] = useState<boolean>(true);

  const handlePolicyChange = () => {
    setPolicyNotExpired((prevState) => {
      const newValue = !prevState;
      if (newValue) {
        setValue('valid_to', null);
      }
      return newValue;
    });
  };

  return (
    <Accordion defaultOpen title="General">
      <div className={Style['general-container']}>
        <Controller
          name="max_budget_wei"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Maximum budget in ETH"
              name="max_budget_wei"
              fullWidth
              error={errors.max_budget_wei?.message}
              required
              placeholder="0.0000"
              inputmode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
            />
          )}
        />
        <Controller
          name="chain_id"
          control={control}
          render={({ field }) => (
            <Select
              name="chain_id"
              label="Network of choice"
              withArrow
              size="large"
              options={blockchainsOptions}
              change={(option) => field.onChange(option?.value || '')}
              value={blockchainsOptions.find((opt) => opt.value === field.value) || null}
              error={errors.chain_id?.message}
              required
            />
          )}
        />
        <div className={Style['date-inputs-row']}>
          <Controller
            name="valid_from"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Start Date"
                value={field.value}
                onChange={field.onChange}
                maxDate={control._formValues.valid_to || undefined}
                fullWidth
                calendarIcon={<Icon width="14" height="16" name="calendar" color="gray900" />}
                showLeadingZeros
                format="yyyy-MM-dd"
              />
            )}
          />
          <Controller
            name="valid_to"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="End Date"
                value={!policyNotExpired ? field.value : ''}
                minDate={control._formValues.valid_from || undefined}
                onChange={field.onChange}
                fullWidth
                disabled={policyNotExpired}
                showLeadingZeros
                format="yyyy-MM-dd"
              />
            )}
          />
        </div>
        <Checkbox
          onChange={handlePolicyChange}
          value={policyNotExpired}
          label="Policy doesn’t expire"
        />
      </div>
    </Accordion>
  );
};
