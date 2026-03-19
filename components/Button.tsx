import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-2xl font-semibold tracking-[0.01em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const variants = {
    primary:
      'bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 hover:bg-slate-800 focus:ring-slate-400',
    secondary:
      'bg-slate-700 text-white shadow-[0_12px_24px_rgba(51,65,85,0.18)] hover:-translate-y-0.5 hover:bg-slate-600 focus:ring-slate-400',
    outline:
      'border border-slate-300 bg-white/90 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-300',
    ghost:
      'text-slate-600 hover:bg-white hover:text-slate-900 focus:ring-slate-300',
    ai:
      'bg-[linear-gradient(135deg,#2563eb_0%,#0f172a_100%)] text-white shadow-[0_18px_40px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(37,99,235,0.32)] focus:ring-blue-400',
  };

  return (
    <button className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
