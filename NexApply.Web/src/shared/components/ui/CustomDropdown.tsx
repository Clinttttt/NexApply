import { useEffect, useRef, useState, type ReactNode } from 'react';
import './CustomDropdown.css';

export interface CustomDropdownOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  meta?: ReactNode;
  count?: number;
  disabled?: boolean;
}

interface CustomDropdownProps<T = string> {
  options: CustomDropdownOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function CustomDropdown<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  icon,
  className = '',
  disabled = false,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom');

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !menuRef.current || !dropdownRef.current) return;

    const buttonRect = dropdownRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      setMenuPosition('top');
    } else {
      setMenuPosition('bottom');
    }
  }, [isOpen]);

  const handleSelect = (option: CustomDropdownOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`custom-dropdown ${className} ${isOpen ? 'custom-dropdown--open' : ''} ${disabled ? 'custom-dropdown--disabled' : ''}`}
    >
      <button
        type="button"
        className="custom-dropdown__trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {icon && <span className="custom-dropdown__icon">{icon}</span>}
        <span className="custom-dropdown__label">
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className="custom-dropdown__chevron"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`custom-dropdown__menu custom-dropdown__menu--${menuPosition}`}
          role="listbox"
        >
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              className={`custom-dropdown__item ${option.value === value ? 'custom-dropdown__item--active' : ''} ${option.disabled ? 'custom-dropdown__item--disabled' : ''}`}
              onClick={() => handleSelect(option)}
              disabled={option.disabled}
              role="option"
              aria-selected={option.value === value}
            >
              {option.icon && <span className="custom-dropdown__item-icon">{option.icon}</span>}
              <div className="custom-dropdown__item-content">
                <span className="custom-dropdown__item-label">{option.label}</span>
                {option.meta && <div className="custom-dropdown__item-meta">{option.meta}</div>}
              </div>
              {option.count !== undefined && (
                <span className="custom-dropdown__item-count">{option.count}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
