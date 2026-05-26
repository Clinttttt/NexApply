import { useNavigate } from 'react-router-dom';
import './CompanyHeader.css';

interface CompanyHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
}

export function CompanyHeader({
  title,
  subtitle,
  searchValue,
  searchPlaceholder,
  onSearchChange,
}: CompanyHeaderProps) {
  const navigate = useNavigate();
  const isSearchControlled = typeof onSearchChange === 'function';

  return (
    <header className="rec-header" role="banner">
      <div className="rec-header-left">
        <h1 className="rec-page-title">
          {title}
          {subtitle && <span className="rec-page-subtitle">{subtitle}</span>}
        </h1>
      </div>
      <div className="rec-header-right">
        <div className="rec-search-wrap" role="search">
          <span className="rec-search-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            type="search"
            className="rec-search-input"
            placeholder={searchPlaceholder ?? "Search applicants, jobs…"}
            aria-label="Search"
            value={isSearchControlled ? (searchValue ?? "") : undefined}
            onChange={
              isSearchControlled
                ? (e) => onSearchChange?.(e.target.value)
                : undefined
            }
          />
        </div>
        <button
          type="button"
          className="rec-header-avatar"
          aria-label="Open company profile"
          title="Company profile"
          onClick={() => navigate('/company-profile')}
        >
          AV
        </button>
      </div>
    </header>
  );
}
