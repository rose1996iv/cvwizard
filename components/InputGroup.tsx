import React from 'react';

interface InputGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
}) => {
  const inputClassName =
    'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_10px_25px_rgba(15,23,42,0.04)] transition-all placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100';

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</label>
      {multiline ? (
        <textarea
          className={`${inputClassName} min-h-[120px] resize-y`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className={inputClassName}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};
