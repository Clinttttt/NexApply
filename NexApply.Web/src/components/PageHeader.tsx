import type { ReactNode } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  onMenuToggle?: () => void;
}

export const PageHeader = ({ title, subtitle, children, onMenuToggle }: PageHeaderProps) => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        {onMenuToggle && (
          <button
            type="button"
            className="student-menu-toggle"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <div className="topbar-title-group">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="topbar-right">
        {children}
      </div>
    </div>
  );
};
