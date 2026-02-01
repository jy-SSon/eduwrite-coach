
import React from 'react';

interface InputGroupProps {
  label: string;
  children: React.ReactNode;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, children }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">
        {label}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

interface TextFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  type?: 'text' | 'textarea';
}

const commonClasses = "w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm bg-white";

export const TextField: React.FC<TextFieldProps> = ({ label, value, placeholder, onChange, type = 'text' }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={commonClasses}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={commonClasses}
        />
      )}
    </div>
  );
};

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={commonClasses}
      >
        <option value="" disabled>선택해주세요</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

interface DatalistFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  id: string;
}

export const DatalistField: React.FC<DatalistFieldProps> = ({ label, value, options, onChange, placeholder, id }) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        list={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={commonClasses}
      />
      <datalist id={id}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  );
};
