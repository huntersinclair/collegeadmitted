import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface InputProps extends Omit<TextFieldProps, 'error'> {
  error?: string;
}

const Input: React.FC<InputProps> = ({ error, helperText, ...props }) => {
  return (
    <TextField
      fullWidth
      margin="normal"
      error={!!error}
      helperText={error || helperText}
      {...props}
    />
  );
};

export default Input; 