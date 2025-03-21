import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}) => {
  // Map our variants to Material UI variants and colors
  const getButtonProps = () => {
    switch (variant) {
      case 'primary':
        return { variant: 'contained', color: 'primary' };
      case 'secondary':
        return { variant: 'contained', color: 'secondary' };
      case 'outline':
        return { variant: 'outlined', color: 'primary' };
      default:
        return { variant: 'contained', color: 'primary' };
    }
  };

  return (
    <MuiButton
      {...getButtonProps()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={16}
          color="inherit"
          sx={{ marginRight: 1 }}
        />
      )}
      {children}
    </MuiButton>
  );
};

export default Button; 