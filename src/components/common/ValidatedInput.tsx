'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

type ValidatedInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
} & Omit<TextFieldProps, 'name'>;

export function ValidatedInput<T extends FieldValues>({
  name,
  control,
  ...textFieldProps
}: ValidatedInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...textFieldProps}
          {...field}
          value={field.value ?? ''}
          error={!!error || textFieldProps.error}
          helperText={error?.message || textFieldProps.helperText}
        />
      )}
    />
  );
}
