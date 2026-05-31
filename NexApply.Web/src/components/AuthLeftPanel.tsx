import { useEffect, useState } from 'react';
import { testimonialService } from '../services/testimonialService';
import { publicStatsService } from '../services/publicStatsService';

interface AuthLeftPanelProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
}

interface Testimonial {
  quote: string;
  initials: string;
  name: string;
  role: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
  profilePictureUrl?: string;
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
const getColor = (index: number): 'blue' | 'green' | 'amber' | 'purple' => 
  (['blue', 'green', 'amber', 'purple'] as const)[index % 4];

export function AuthLeftPanel({ eyebrow, title, subtitle }: AuthLeftPanelProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<{ activeListings: number | null; companies: number | null; students: number | null }>({ 
    activeListings: null, 
    companies: null,
    students: null
  });

  useEffect(() => {
    const loadTestimonials = async () => {
      const result = await testimonialService.getTestimonials();
      if (result.isSuccess && result.value && result.value.length > 0) {
        const mapped = result.value.map((t, i) => ({
          quote: t.testimonial,
          initials: getInitials(t.studentName),
          name: t.studentName,
          role: t.role,
          color: getColor(i),
          profilePictureUrl: t.profilePictureUrl,
        }));
        setTestimonials(mapped);
      }
    };
    const loadStats = async () => {
      const result = await publicStatsService.getStats();
      if (result.isSuccess && result.value) {
        setStats(result.value);
      }
    };
    loadTestimonials();
    loadStats();
  }, []);
  return (
    <div className="auth-left">
      {/* Decorative grid */}
      <div className="left-grid">
        <div className="grid-line grid-line--v1"></div>
        <div className="grid-line grid-line--v2"></div>
        <div className="grid-line grid-line--h1"></div>
        <div className="grid-line grid-line--h2"></div>
        <div className="grid-orb grid-orb--1"></div>
        <div className="grid-orb grid-orb--2"></div>
      </div>

      {/* Content */}
      <div className="auth-left-inner">
        {/* Brand + Eyebrow Group */}
        <div className="brand-group">
          {/* Brand */}
          <div className="brand">
            <div className="brand-logo">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="#1D4ED8"/>
                <path d="M10 10V18M10 10L18 18M18 18V10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="brand-name">NexApply</span>
          </div>

          {/* Eyebrow */}
          {(eyebrow || (stats.students !== null && stats.students > 0)) && (
            <div className="left-eyebrow">
              <span className="eyebrow-dot"></span>
              {eyebrow || `Trusted by ${stats.students?.toLocaleString()}+ students`}
            </div>
          )}
        </div>

        {/* Headline */}
        <div className="left-headline">
          <h1 className="left-title" dangerouslySetInnerHTML={{ __html: title }} />
          <p className="left-sub">{subtitle}</p>
        </div>

        {/* Stats */}
        <div className="left-stats">
          <div className="left-stat">
            <div className="stat-value">{stats.activeListings !== null ? `${stats.activeListings.toLocaleString()}+` : '---'}</div>
            <div className="stat-label">Active listings</div>
          </div>
          <div className="stat-divider"></div>
          <div className="left-stat">
            <div className="stat-value">{stats.companies !== null ? stats.companies.toLocaleString() : '---'}</div>
            <div className="stat-label">Companies</div>
          </div>
          <div className="stat-divider"></div>
          <div className="left-stat">
            <div className="stat-value">Free</div>
            <div className="stat-label">For students</div>
          </div>
        </div>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="ticker-wrap">
            <div className="ticker-track">
              {testimonials.map((t, i) => (
                <div key={i} className="ticker-card">
                  <div className="ticker-author">
                    <div className={`ticker-avatar ticker-avatar--${t.color}`}>
                      {t.profilePictureUrl ? (
                        <img src={t.profilePictureUrl} alt={t.name} className="ticker-avatar-img" />
                      ) : (
                        t.initials
                      )}
                    </div>
                    <div>
                      <span className="ticker-name">{t.name}</span>
                      <span className="ticker-role">{t.role}</span>
                    </div>
                  </div>
                  <p className="ticker-quote">{t.quote}</p>
                </div>
              ))}
              {/* Duplicate for infinite scroll only if multiple testimonials */}
              {testimonials.length > 1 && testimonials.map((t, i) => (
                <div key={`dup-${i}`} className="ticker-card">
                  <div className="ticker-author">
                    <div className={`ticker-avatar ticker-avatar--${t.color}`}>
                      {t.profilePictureUrl ? (
                        <img src={t.profilePictureUrl} alt={t.name} className="ticker-avatar-img" />
                      ) : (
                        t.initials
                      )}
                    </div>
                    <div>
                      <span className="ticker-name">{t.name}</span>
                      <span className="ticker-role">{t.role}</span>
                    </div>
                  </div>
                  <p className="ticker-quote">{t.quote}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
