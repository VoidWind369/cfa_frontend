import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = "", hover = false }: CardProps) => (
  <div className={`
    bg-white/75 backdrop-blur-xl border border-white/60
    rounded-3xl shadow-soft
    ${hover ? 'transition-all duration-300 ease-bounce-soft hover:shadow-card hover:-translate-y-1 hover:border-brand-soft/60' : ''}
    ${className}
  `}>
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = "",
  loading = false,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = `
    font-medium rounded-xl
    transition-all duration-200 ease-out
    active:scale-[0.97]
    focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 focus:ring-offset-brand-base/50
    inline-flex items-center justify-center gap-1.5
    relative overflow-hidden
    disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
    btn-shimmer
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-brand-primary to-brand-glow text-white
      shadow-soft hover:shadow-glow hover:shadow-brand-primary/25
      btn-shimmer-primary
    `,
    secondary: `
      bg-white/60 text-brand-text border border-brand-border/80 backdrop-blur-sm
      hover:bg-white hover:border-brand-soft/80 hover:shadow-soft
      btn-shimmer-secondary
    `,
    ghost: `
      text-brand-text hover:bg-brand-muted/80
      hover:text-brand-primary
    `,
    danger: `
      bg-gradient-to-r from-brand-error to-rose-400 text-white
      shadow-soft hover:shadow-lg hover:shadow-brand-error/20
      btn-shimmer-primary
    `,
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
}

export const InputField = ({ label, error, suffix, className = "", ...props }: InputProps) => (
  <div className="mb-4">
    {label && (
      <label className="block text-xs font-semibold text-brand-text mb-1.5 ml-1">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        className={`
          w-full px-4 py-3 bg-white/60 border border-brand-border/60 rounded-xl
          focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40
          focus:bg-white focus:shadow-glow focus:shadow-brand-primary/10
          outline-none transition-all duration-200
          text-sm text-brand-text placeholder:text-brand-textLight
          backdrop-blur-sm
          hover:border-brand-soft/60
          ${suffix ? 'pr-12' : ''}
          ${error ? 'border-brand-error/50 focus:ring-brand-error/30 focus:border-brand-error/50 focus:shadow-brand-error/10' : ''}
          ${className}
        `}
        {...props}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {suffix}
        </div>
      )}
    </div>
    {error && (
      <p className="mt-1.5 ml-1 text-xs text-brand-error animate-slide-down">{error}</p>
    )}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  type?: 'success' | 'warning' | 'error' | 'default';
  className?: string;
}

export const Badge = ({ children, type = "default", className = "" }: BadgeProps) => {
  const styles = {
    success: "bg-emerald-50/80 text-emerald-600 border border-emerald-200/60",
    warning: "bg-amber-50/80 text-amber-600 border border-amber-200/60",
    error: "bg-rose-50/80 text-rose-500 border border-rose-200/60",
    default: "bg-brand-soft/30 text-brand-primary border border-brand-soft/50",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium backdrop-blur-sm ${styles[type]} ${className}`}>
      {children}
    </span>
  );
};

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export const Toggle = ({ checked, onChange, label, description }: ToggleProps) => (
  <div className="flex items-center justify-between py-3">
    <div>
      {label && <p className="text-sm font-medium text-brand-text">{label}</p>}
      {description && <p className="text-xs text-brand-textLight mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-all duration-300 ease-bounce-soft
        focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 focus:ring-offset-brand-base/50
        ${checked ? 'bg-gradient-to-r from-brand-primary to-brand-glow' : 'bg-brand-border'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full
          bg-white shadow-md
          transition-transform duration-300 ease-bounce-soft
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = ({ label, options, className = "", ...props }: SelectProps) => (
  <div className="mb-4 relative">
    {label && (
      <label className="block text-xs font-semibold text-brand-text mb-1.5 ml-1">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        className={`
          w-full px-4 py-3 bg-white/60 border border-brand-border/60 rounded-xl
          focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40
          focus:bg-white focus:shadow-glow focus:shadow-brand-primary/10
          outline-none transition-all duration-200
          text-sm text-brand-text appearance-none cursor-pointer
          backdrop-blur-sm pr-10
          hover:border-brand-soft/60
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textLight pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = ({ label, className = "", ...props }: TextareaProps) => (
  <div className="mb-4">
    {label && (
      <label className="block text-xs font-semibold text-brand-text mb-1.5 ml-1">
        {label}
      </label>
    )}
    <textarea
      className={`
        w-full px-4 py-3 bg-white/60 border border-brand-border/60 rounded-xl
        focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40
        focus:bg-white focus:shadow-glow focus:shadow-brand-primary/10
        outline-none transition-all duration-200
        text-sm text-brand-text resize-none
        placeholder:text-brand-textLight
        backdrop-blur-sm
        hover:border-brand-soft/60
        ${className}
      `}
      rows={4}
      {...props}
    />
  </div>
);

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({ page, pageSize, total, onPageChange, className = "" }: PaginationProps) => {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      <div className="text-xs text-brand-textLight">
        <span className="font-medium text-brand-text">{total}</span> {t('common.pagination.items')}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          className="p-1.5 rounded-lg text-brand-textLight hover:bg-brand-muted hover:text-brand-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title={t('common.pagination.first')}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="p-1.5 rounded-lg text-brand-textLight hover:bg-brand-muted hover:text-brand-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title={t('common.pagination.prev')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {getPageNumbers().map((p, idx) => (
          typeof p === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(p)}
              className={`min-w-8 h-8 px-2 rounded-lg text-sm font-medium transition-all ${
                p === page
                  ? 'bg-gradient-to-r from-brand-primary to-brand-glow text-white shadow-md shadow-brand-primary/25'
                  : 'text-brand-textLight hover:bg-brand-muted hover:text-brand-text'
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-1 text-brand-textLight/50">...</span>
          )
        ))}
        
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="p-1.5 rounded-lg text-brand-textLight hover:bg-brand-muted hover:text-brand-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title={t('common.pagination.next')}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          className="p-1.5 rounded-lg text-brand-textLight hover:bg-brand-muted hover:text-brand-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title={t('common.pagination.last')}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white/90 backdrop-blur-xl border border-white/70 rounded-3xl shadow-float p-6 max-w-sm w-full animate-slide-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-semibold text-brand-text text-base">{title}</h3>
        </div>
        <p className="text-sm text-brand-textLight ml-[3.25rem]">{message}</p>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={onCancel}>
            {cancelText || t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmText || t('common.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};
