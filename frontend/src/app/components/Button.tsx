'use client';

import { forwardRef } from 'react';
import { Button as MuiButton } from '@mui/material';
import { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<MuiButtonProps, 'color' | 'variant'> {
  loading?: boolean;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading, disabled, variant = 'contained', color = 'primary', ...props }, ref) => {
    const getButtonProps = () => {
      const buttonProps: ButtonProps = {
        variant,
        color,
      };

      if (loading) {
        buttonProps.startIcon = <Loader2 className="h-4 w-4 animate-spin" />;
      }

      return buttonProps;
    };

    return (
      <MuiButton
        ref={ref}
        {...getButtonProps()}
        disabled={disabled || loading}
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button'; 