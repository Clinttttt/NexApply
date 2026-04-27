interface AuthLeftPanelProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

interface Testimonial {
  quote: string;
  initials: string;
  name: string;
  role: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

const testimonials: Testimonial[] = [
  {
    quote: 'Got my first internship offer within 2 weeks of uploading my resume.',
    initials: 'KR',
    name: 'Kira Reyes',
    role: 'Full-Stack Intern · CodeBridge Co.',
    color: 'blue'
  },
  {
    quote: 'The resume matching feature showed me roles I actually qualified for. Game changer.',
    initials: 'MG',
    name: 'Marco Guerrero',
    role: 'React Intern · NovaByte Inc.',
    color: 'green'
  },
  {
    quote: 'Applied to 6 companies in one morning. The pipeline tracker kept me sane during interviews.',
    initials: 'SC',
    name: 'Sofia Cruz',
    role: 'API Developer Intern · ApexCore Solutions',
    color: 'amber'
  },
  {
    quote: 'Landed a full-time role straight out of college. NexApply made the process so much less overwhelming.',
    initials: 'RO',
    name: 'Rachel Ong',
    role: 'Backend Engineer · TechSpark PH',
    color: 'purple'
  }
];

export function AuthLeftPanel({ eyebrow, title, subtitle }: AuthLeftPanelProps) {
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
          <div className="left-eyebrow">
            <span className="eyebrow-dot"></span>
            {eyebrow}
          </div>
        </div>

        {/* Headline */}
        <div className="left-headline">
          <h1 className="left-title" dangerouslySetInnerHTML={{ __html: title }} />
          <p className="left-sub">{subtitle}</p>
        </div>

        {/* Stats */}
        <div className="left-stats">
          <div className="left-stat">
            <div className="stat-value">2,400+</div>
            <div className="stat-label">Active listings</div>
          </div>
          <div className="stat-divider"></div>
          <div className="left-stat">
            <div className="stat-value">840</div>
            <div className="stat-label">Companies</div>
          </div>
          <div className="stat-divider"></div>
          <div className="left-stat">
            <div className="stat-value">Free</div>
            <div className="stat-label">For students</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="ticker-wrap">
          <div className="ticker-track">
            {/* First set */}
            {testimonials.map((t, i) => (
              <div key={i} className="ticker-card">
                <div className="ticker-author">
                  <div className={`ticker-avatar ticker-avatar--${t.color}`}>{t.initials}</div>
                  <div>
                    <span className="ticker-name">{t.name}</span>
                    <span className="ticker-role">{t.role}</span>
                  </div>
                </div>
                <p className="ticker-quote">{t.quote}</p>
              </div>
            ))}
            {/* Duplicate for infinite scroll */}
            {testimonials.map((t, i) => (
              <div key={`dup-${i}`} className="ticker-card">
                <div className="ticker-author">
                  <div className={`ticker-avatar ticker-avatar--${t.color}`}>{t.initials}</div>
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
      </div>
    </div>
  );
}
