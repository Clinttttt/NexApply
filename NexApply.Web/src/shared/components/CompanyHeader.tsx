import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './CompanyHeader.css';
import { companyProfileService } from '@/shared/api/companyProfileService';

interface CompanyHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onMenuToggle?: () => void;
}

export function CompanyHeader({
  title,
  subtitle,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  onMenuToggle,
}: CompanyHeaderProps) {
  const navigate = useNavigate();
  const isSearchControlled = typeof onSearchChange === 'function';
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    const loadCompanyProfile = async () => {
      const result = await companyProfileService.getProfile();
      if (result.isSuccess && result.value) {
        setCompanyLogo(result.value.logoUrl || null);
        setCompanyName(result.value.companyName || '');
      }
    };
    loadCompanyProfile();
  }, []);

  return (
    <header className="rec-header" role="banner">
      <div className="rec-header-left">
        {onMenuToggle && (
          <button
            type="button"
            className="rec-menu-toggle"
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
        <div>
          <h1 className="rec-page-title">{title}</h1>
          {subtitle && <span className="rec-page-subtitle">{subtitle}</span>}
        </div>
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
          {companyLogo ? (
            <img src={companyLogo} alt={companyName} className="rec-header-avatar-img" />
          ) : (
            companyName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'AV'
          )}
        </button>
      </div>
    </header>
  );
}
