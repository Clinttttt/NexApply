import { useState, useEffect, useRef } from 'react';
import { companyProfileService, type CompanyProfileDto } from '../../services/companyProfileService';
import { CompanySidebar } from '../../components/CompanySidebar';
import { CompanyHeader } from '../../components/CompanyHeader';
import { CompanyProfileSkeleton } from './CompanyProfileSkeleton';
import './CompanyProfile.css';

// ── Constants ──────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Software & Technology', 'Financial Services', 'Healthcare', 'Education',
  'E-commerce & Retail', 'Media & Entertainment', 'Manufacturing',
  'Telecommunications', 'Consulting', 'Government', 'Non-profit', 'Other',
];

const CULTURE_OPTIONS = [
  'Collaborative', 'Fast-paced', 'Innovative', 'Data-driven', 'Customer-obsessed',
  'Remote-first', 'Inclusive', 'Results-oriented', 'Mission-driven', 'Flat hierarchy',
];

// ── Types ──────────────────────────────────────────────────────────────────

interface ProfileState {
  companyName: string;
  tagline: string;
  industry: string;
  companySize: string;
  location: string;
  founded: string;
  website: string;
  logoUrl: string;
  about: string;
  mission: string;
  contactEmail: string;
  contactPhone: string;
  hiringManagerName: string;
  hiringManagerTitle: string;
  hiringManagerEmail: string;
  activeListingsCount: number;
  perks: string[];
  cultureTags: string[];
}

interface SocialField {
  key: string;
  icon: string;
  placeholder: string;
  value: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function makeEmptyProfile(): ProfileState {
  return {
    companyName: '', tagline: '', industry: '', companySize: '',
    location: '', founded: '', website: '', logoUrl: '',
    about: '', mission: '', contactEmail: '', contactPhone: '',
    hiringManagerName: '', hiringManagerTitle: '', hiringManagerEmail: '',
    activeListingsCount: 0, perks: [], cultureTags: [],
  };
}

function cloneProfile(p: ProfileState): ProfileState {
  return { ...p, perks: [...p.perks], cultureTags: [...p.cultureTags] };
}

function or(value: string | null | undefined, fallback = '—'): string {
  return value && value.trim() ? value : fallback;
}

function getInitials(name?: string | null): string {
  if (!name) return '';
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

function makeSocialFields(
  linkedin = '', facebook = '', twitter = '', github = ''
): SocialField[] {
  return [
    { key: 'LinkedIn', icon: 'in', placeholder: 'https://linkedin.com/company/…', value: linkedin },
    { key: 'Facebook', icon: 'f',  placeholder: 'https://facebook.com/…',         value: facebook },
    { key: 'Twitter',  icon: '𝕏',  placeholder: 'https://twitter.com/…',          value: twitter  },
    { key: 'GitHub',   icon: 'gh', placeholder: 'https://github.com/…',            value: github   },
  ];
}

function mapDtoToProfile(dto: CompanyProfileDto): {
  profile: ProfileState;
  socialFields: SocialField[];
} {
  const profile: ProfileState = {
    companyName:        dto.companyName        ?? '',
    tagline:            dto.tagline            ?? '',
    industry:           dto.industry           ?? '',
    companySize:        dto.companySize        ?? '',
    location:           dto.location           ?? '',
    founded:            dto.founded            ?? '',
    website:            dto.website            ?? '',
    logoUrl:            dto.logoUrl            ?? '',
    about:              dto.description        ?? '',
    mission:            dto.mission            ?? '',
    contactEmail:       dto.contactEmail       ?? '',
    contactPhone:       dto.contactPhone       ?? '',
    hiringManagerName:  dto.hiringManagerName  ?? '',
    hiringManagerTitle: dto.hiringManagerTitle ?? '',
    hiringManagerEmail: dto.hiringManagerEmail ?? '',
    activeListingsCount: dto.activeListingsCount ?? 0,
    perks: dto.perksAndBenefits
      ? dto.perksAndBenefits.split(',').map(p => p.trim()).filter(Boolean)
      : [],
    cultureTags: dto.workCulture
      ? dto.workCulture.split(',').map(c => c.trim()).filter(Boolean)
      : [],
  };

  const socialFields = makeSocialFields(
    dto.linkedInUrl  ?? '',
    dto.facebookUrl  ?? '',
    dto.twitterUrl   ?? '',
    dto.gitHubUrl    ?? '',
  );

  return { profile, socialFields };
}

// ── Component ──────────────────────────────────────────────────────────────

export function CompanyProfile() {
  const [profile,       setProfile]       = useState<ProfileState>(makeEmptyProfile());
  const [profileBackup, setProfileBackup] = useState<ProfileState | null>(null);
  const [socialFields,  setSocialFields]  = useState<SocialField[]>(makeSocialFields());
  const [socialBackup,  setSocialBackup]  = useState<string[] | null>(null);

  const [isEditing,      setIsEditing]      = useState(false);
  const [isLoading,      setIsLoading]      = useState(true);
  const [isSaving,       setIsSaving]       = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [loadError,      setLoadError]      = useState<string | null>(null);

  const [perkInput,      setPerkInput]      = useState('');
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Load ──

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    setIsLoading(true);
    setLoadError(null);

    const result = await companyProfileService.getProfile();
    if (result.isSuccess && result.value) {
      const { profile: p, socialFields: s } = mapDtoToProfile(result.value);
      setProfile(p);
      setSocialFields(s);
    } else {
      setLoadError(result.error ?? 'Failed to load profile');
    }

    setIsLoading(false);
  }

  // ── Edit ──

  function startEdit() {
    setProfileBackup(cloneProfile(profile));
    setSocialBackup(socialFields.map(s => s.value));
    setUploadedLogoUrl(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    if (profileBackup)  setProfile(cloneProfile(profileBackup));
    if (socialBackup) {
      setSocialFields(prev =>
        prev.map((s, i) => ({ ...s, value: socialBackup[i] ?? '' }))
      );
    }
    setUploadedLogoUrl(null);
    setIsEditing(false);
  }

  async function saveProfile() {
    setIsSaving(true);

    const command = {
      companyName:        profile.companyName,
      tagline:            profile.tagline,
      description:        profile.about,
      mission:            profile.mission,
      website:            profile.website,
      logoUrl:            uploadedLogoUrl ?? profile.logoUrl,
      industry:           profile.industry,
      location:           profile.location,
      companySize:        profile.companySize,
      founded:            profile.founded,
      perksAndBenefits:   profile.perks.join(', '),
      workCulture:        profile.cultureTags.join(', '),
      contactEmail:       profile.contactEmail,
      contactPhone:       profile.contactPhone,
      linkedInUrl:        socialFields.find(s => s.key === 'LinkedIn')?.value,
      twitterUrl:         socialFields.find(s => s.key === 'Twitter')?.value,
      facebookUrl:        socialFields.find(s => s.key === 'Facebook')?.value,
      gitHubUrl:          socialFields.find(s => s.key === 'GitHub')?.value,
      hiringManagerName:  profile.hiringManagerName,
      hiringManagerTitle: profile.hiringManagerTitle,
      hiringManagerEmail: profile.hiringManagerEmail,
    };

    const result = await companyProfileService.updateProfile(command);
    if (result.isSuccess && result.value) {
      const { profile: p, socialFields: s } = mapDtoToProfile(result.value);
      setProfile(p);
      setSocialFields(s);
      setProfileBackup(null);
      setSocialBackup(null);
      setUploadedLogoUrl(null);
      setIsEditing(false);
      setShowSavedBanner(true);
      setTimeout(() => setShowSavedBanner(false), 3500);
    } else {
      setLoadError(result.error ?? 'Failed to save profile');
    }

    setIsSaving(false);
  }

  // ── Logo ──

  function triggerLogoUpload() {
    logoInputRef.current?.click();
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setLoadError('Logo file size must be less than 5MB');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setLoadError('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedLogoUrl(base64);
      setProfile(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  }

  // ── Perks ──

  function addPerk() {
    const trimmed = perkInput.trim();
    if (trimmed && !profile.perks.includes(trimmed)) {
      setProfile(prev => ({ ...prev, perks: [...prev.perks, trimmed] }));
      setPerkInput('');
    }
  }

  function removePerk(perk: string) {
    setProfile(prev => ({ ...prev, perks: prev.perks.filter(p => p !== perk) }));
  }

  function handlePerkKeydown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addPerk(); }
  }

  // ── Culture ──

  function toggleCultureTag(tag: string) {
    setProfile(prev => ({
      ...prev,
      cultureTags: prev.cultureTags.includes(tag)
        ? prev.cultureTags.filter(t => t !== tag)
        : [...prev.cultureTags, tag],
    }));
  }

  // ── Social ──

  function updateSocialField(key: string, value: string) {
    setSocialFields(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  }

  // ── Profile field helper ──

  function setField<K extends keyof ProfileState>(key: K, value: ProfileState[K]) {
    setProfile(prev => ({ ...prev, [key]: value }));
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="app-shell">
        <CompanySidebar />
        <div className="main-content">
          <CompanyHeader title="Company Profile" subtitle="Manage your company's public presence on NexApply" />
          <div className="page-body">
            <CompanyProfileSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (loadError && !profile.companyName) {
    return (
      <div className="app-shell">
        <CompanySidebar />
        <div className="main-content">
          <CompanyHeader title="Company Profile" subtitle="Manage your company's public presence on NexApply" />
          <div className="page-body">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#DC2626', gap: '16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>{loadError}</div>
              <button className="btn-primary" onClick={loadProfile}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <CompanySidebar />
      <div className="main-content">
        <CompanyHeader title="Company Profile" subtitle="Manage your company's public presence on NexApply" />

        <div className="page-body">

          {/* Save Banner */}
          {showSavedBanner && (
            <div className="save-banner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Profile updated successfully. Changes are now visible to candidates.
            </div>
          )}

          {/* Main Layout */}
          <div className="profile-layout">

            {/* ── LEFT: Preview Card ── */}
            <aside className="profile-preview">
              <div className="preview-card">
                <div className="preview-card-header">
                  <span className="preview-label">Candidate Preview</span>
                  <span className="preview-hint">How candidates see your company</span>
                </div>

                {/* Logo */}
                <div className="preview-logo-wrap">
                  {profile.logoUrl ? (
                    <div className="preview-logo" style={{ backgroundImage: `url(${profile.logoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  ) : (
                    <div className="preview-logo">
                      <span className="preview-logo-initials">{getInitials(profile.companyName)}</span>
                    </div>
                  )}
                  {isEditing && (
                    <>
                      <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                      <button className="logo-upload-btn" type="button" onClick={triggerLogoUpload}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Logo
                      </button>
                    </>
                  )}
                </div>

                {/* Body */}
                <div className="preview-body">
                  <h2 className="preview-company-name">{or(profile.companyName, 'Company Name')}</h2>
                  {profile.tagline && <p className="preview-tagline">{profile.tagline}</p>}

                  <div className="preview-meta">
                    {profile.industry && (
                      <span className="preview-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        {profile.industry}
                      </span>
                    )}
                    {profile.location && (
                      <span className="preview-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {profile.location}
                      </span>
                    )}
                    {profile.companySize && (
                      <span className="preview-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {profile.companySize}
                      </span>
                    )}
                    {profile.founded && (
                      <span className="preview-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Est. {profile.founded}
                      </span>
                    )}
                  </div>

                  <div className="preview-listings">
                    <span className="preview-listings-count">{profile.activeListingsCount}</span>
                    <span className="preview-listings-label">active listing{profile.activeListingsCount === 1 ? '' : 's'}</span>
                  </div>
                </div>

                {/* Perks preview */}
                {profile.perks.length > 0 && (
                  <div className="preview-perks">
                    {profile.perks.slice(0, 3).map((perk, i) => (
                      <span key={i} className="preview-perk-chip">{perk}</span>
                    ))}
                    {profile.perks.length > 3 && (
                      <span className="preview-perk-chip preview-perk-more">+{profile.perks.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* ── RIGHT: Profile Sections ── */}
            <div className="profile-sections">

              {/* ── Section 1: Basic Information ── */}
              <div className="profile-card">
                <div className="profile-card-header">
               <div className="profile-card-header-left">
                   <div className="profile-card-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="profile-card-title">Basic Information</h2>
                    <p className="profile-card-subtitle">Core details about your company</p>
                  </div>
                </div>
                  <div className="profile-card-actions">
                    {isEditing ? (
                      <>
                        <button className="btn-ghost" onClick={cancelEdit}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Discard Changes
                        </button>
                        <button className="btn-primary" type="button" onClick={saveProfile} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <svg style={{ animation: 'spin 0.7s linear infinite' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-6.219-8.56" />
                              </svg>
                              Saving…
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                              </svg>
                              Save Changes
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button className="btn-secondary" onClick={startEdit}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="profile-card-body">
                  {isEditing ? (
                    <>
                      <div className="field-group">
                        <label className="field-label" htmlFor="company-name">Company Name <span className="required">*</span></label>
                        <input id="company-name" className="field-input" type="text" placeholder="e.g. CodeBridge Co."
                          value={profile.companyName} onChange={e => setField('companyName', e.target.value)} />
                      </div>
                      <div className="field-group">
                        <label className="field-label" htmlFor="tagline">Tagline</label>
                        <input id="tagline" className="field-input" type="text" placeholder="A short, memorable description of your company"
                          value={profile.tagline} onChange={e => setField('tagline', e.target.value)} />
                        <span className="field-hint">Appears directly below your company name on listings.</span>
                      </div>
                      <div className="field-row">
                        <div className="field-group">
                          <label className="field-label" htmlFor="industry">Industry <span className="required">*</span></label>
                          <select id="industry" className="field-select" value={profile.industry} onChange={e => setField('industry', e.target.value)}>
                            <option value="">Select industry…</option>
                            {INDUSTRIES.map(ind => <option key={ind}>{ind}</option>)}
                          </select>
                        </div>
                        <div className="field-group">
                          <label className="field-label" htmlFor="company-size">Company Size</label>
                          <select id="company-size" className="field-select" value={profile.companySize} onChange={e => setField('companySize', e.target.value)}>
                            <option value="">Select size…</option>
                            <option>1–10 employees</option>
                            <option>11–50 employees</option>
                            <option>51–200 employees</option>
                            <option>201–500 employees</option>
                            <option>500+ employees</option>
                          </select>
                        </div>
                      </div>
                      <div className="field-row">
                        <div className="field-group">
                          <label className="field-label" htmlFor="location">Headquarters <span className="required">*</span></label>
                          <input id="location" className="field-input" type="text" placeholder="e.g. Manila, Philippines"
                            value={profile.location} onChange={e => setField('location', e.target.value)} />
                        </div>
                        <div className="field-group">
                          <label className="field-label" htmlFor="founded">Year Founded</label>
                          <input id="founded" className="field-input" type="text" placeholder="e.g. 2018"
                            value={profile.founded} onChange={e => setField('founded', e.target.value)} />
                        </div>
                      </div>
                      <div className="field-group">
                        <label className="field-label" htmlFor="website">Website</label>
                        <input id="website" className="field-input" type="url" placeholder="https://yourcompany.com"
                          value={profile.website} onChange={e => setField('website', e.target.value)} />
                      </div>
                    </>
                  ) : (
                    <div className="view-info-grid">
                      <span className="vig-key">Company Name</span>
                      <span className="vig-val">{or(profile.companyName)}</span>
                      <span className="vig-key">Tagline</span>
                      <span className="vig-val vig-val--muted">{or(profile.tagline, 'Not set')}</span>
                      <span className="vig-key">Industry</span>
                      <span className="vig-val">{or(profile.industry)}</span>
                      <span className="vig-key">Company Size</span>
                      <span className="vig-val">{or(profile.companySize)}</span>
                      <span className="vig-key">Headquarters</span>
                      <span className="vig-val">{or(profile.location)}</span>
                      <span className="vig-key">Founded</span>
                      <span className="vig-val">{profile.founded ? `Est. ${profile.founded}` : '—'}</span>
                      <span className="vig-key">Website</span>
                      <span className="vig-val">
                        {profile.website
                          ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="vig-link">{profile.website}</a>
                          : '—'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Section 2: About the Company ── */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div  className="profile-card-header-left">
                    <div className="profile-card-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="profile-card-title">About the Company</h2>
                    <p className="profile-card-subtitle">Tell candidates what makes your company great</p>
                  </div>
                  </div>
                
                </div>

                <div className="profile-card-body">
                  {isEditing ? (
                    <>
                      <div className="field-group">
                        <label className="field-label" htmlFor="about">Company Description <span className="required">*</span></label>
                        <textarea id="about" className="field-textarea" rows={6}
                          placeholder="Describe your company's mission, culture, products, and what makes it a great place to work…"
                          value={profile.about} onChange={e => setField('about', e.target.value)} />
                        <span className="field-hint">Aim for 100–300 words. This is the first thing candidates read about you.</span>
                      </div>
                      <div className="field-group">
                        <label className="field-label" htmlFor="mission">Mission Statement</label>
                        <textarea id="mission" className="field-textarea" rows={3}
                          placeholder="e.g. We build bridges between talent and opportunity."
                          value={profile.mission} onChange={e => setField('mission', e.target.value)} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="view-text-block">
                        <span className="view-block-label">Description</span>
                        <p className="view-block-text">{or(profile.about, 'No description added yet.')}</p>
                      </div>
                      {profile.mission && (
                        <div className="view-text-block">
                          <span className="view-block-label">Mission</span>
                          <p className="view-block-text view-block-text--mission">{profile.mission}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ── Section 3: Culture & Perks ── */}
              <div className="profile-card">         
                <div className="profile-card-header">
                       <div className="profile-card-header-left">
                      <div className="profile-card-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="profile-card-title">Culture & Perks</h2>
                    <p className="profile-card-subtitle">Benefits and values that attract top talent</p>
                  </div>
                </div>
                   </div>
              

                <div className="profile-card-body">
                  {isEditing ? (
                    <>
                      <div className="field-group">
                        <label className="field-label">Perks & Benefits</label>
                        <div className="perk-input-row">
                          <input className="field-input perk-input" type="text"
                            placeholder="e.g. Remote-first, Health insurance, Learning budget…"
                            value={perkInput}
                            onChange={e => setPerkInput(e.target.value)}
                            onKeyDown={handlePerkKeydown} />
                          <button className="btn-add" type="button" onClick={addPerk}>Add</button>
                        </div>
                        {profile.perks.length > 0 && (
                          <div className="perk-tags">
                            {profile.perks.map((perk, i) => (
                              <div key={i} className="perk-tag">
                                <span>{perk}</span>
                                <button type="button" className="perk-remove" onClick={() => removePerk(perk)} aria-label={`Remove ${perk}`}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <span className="field-hint">Press Enter or click Add. These appear on all your listings.</span>
                      </div>

                      <div className="field-group">
                        <label className="field-label">Work Culture Tags</label>
                        <div className="culture-tags">
                          {CULTURE_OPTIONS.map(tag => (
                            <button key={tag} type="button"
                              className={`culture-tag${profile.cultureTags.includes(tag) ? ' selected' : ''}`}
                              onClick={() => toggleCultureTag(tag)}>
                              {tag}
                            </button>
                          ))}
                        </div>
                        <span className="field-hint">Select all that apply.</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {profile.perks.length > 0 && (
                        <div className="view-perk-section">
                          <span className="view-block-label">Perks & Benefits</span>
                          <div className="view-perk-tags">
                            {profile.perks.map((perk, i) => (
                              <span key={i} className="view-perk-chip">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {perk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.cultureTags.length > 0 && (
                        <div className="view-perk-section">
                          <span className="view-block-label">Work Culture</span>
                          <div className="view-perk-tags">
                            {profile.cultureTags.map((tag, i) => (
                              <span key={i} className="culture-view-chip">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.perks.length === 0 && profile.cultureTags.length === 0 && (
                        <p className="view-empty">No perks or culture tags added yet.</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ── Section 4: Contact & Social ── */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-card-header-left">
                      <div className="profile-card-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="profile-card-title">Contact & Social</h2>
                    <p className="profile-card-subtitle">How candidates can reach you or learn more</p>
                  </div>
                    </div>
                
                </div>

                <div className="profile-card-body">
                  {isEditing ? (
                    <>
                      <div className="field-row">
                        <div className="field-group">
                          <label className="field-label" htmlFor="contact-email">Contact Email</label>
                          <input id="contact-email" className="field-input" type="email" placeholder="careers@yourcompany.com"
                            value={profile.contactEmail} onChange={e => setField('contactEmail', e.target.value)} />
                        </div>
                        <div className="field-group">
                          <label className="field-label" htmlFor="contact-phone">Contact Phone</label>
                          <input id="contact-phone" className="field-input" type="tel" placeholder="+63 2 1234 5678"
                            value={profile.contactPhone} onChange={e => setField('contactPhone', e.target.value)} />
                        </div>
                      </div>
                      <div className="social-fields">
                        {socialFields.map(social => (
                          <div key={social.key} className="field-group social-field-group">
                            <label className="field-label social-label" htmlFor={`social-${social.key.toLowerCase()}`}>
                              <span className={`social-icon social-icon--${social.key.toLowerCase()}`}>{social.icon}</span>
                              {social.key}
                            </label>
                            <input id={`social-${social.key.toLowerCase()}`} className="field-input" type="url"
                              placeholder={social.placeholder} value={social.value}
                              onChange={e => updateSocialField(social.key, e.target.value)} />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="view-info-grid">
                        <span className="vig-key">Email</span>
                        <span className="vig-val">
                          {profile.contactEmail
                            ? <a href={`mailto:${profile.contactEmail}`} className="vig-link">{profile.contactEmail}</a>
                            : '—'}
                        </span>
                        <span className="vig-key">Phone</span>
                        <span className="vig-val">{or(profile.contactPhone)}</span>
                      </div>
                      <div className="social-view-list">
                        {socialFields.filter(s => s.value).map(social => (
                          <a key={social.key} href={social.value} target="_blank" rel="noopener noreferrer" className="social-view-item">
                            <span className={`social-icon social-icon--${social.key.toLowerCase()}`}>{social.icon}</span>
                            <span className="social-view-name">{social.key}</span>
                            <span className="social-view-url">{social.value}</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        ))}
                        {!socialFields.some(s => s.value) && (
                          <p className="view-empty">No social links added yet.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Section 5: Hiring Manager ── */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-card-header-left">            
                      <div className="profile-card-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="profile-card-title">Hiring Manager</h2>
                    <p className="profile-card-subtitle">The person candidates will interact with</p>
                  </div>
                    </div>
                
                </div>

                <div className="profile-card-body">
                  {isEditing ? (
                    <>
                      <div className="field-row">
                        <div className="field-group">
                          <label className="field-label" htmlFor="hm-name">Full Name</label>
                          <input id="hm-name" className="field-input" type="text" placeholder="e.g. Anna Vidal"
                            value={profile.hiringManagerName} onChange={e => setField('hiringManagerName', e.target.value)} />
                        </div>
                        <div className="field-group">
                          <label className="field-label" htmlFor="hm-title">Job Title</label>
                          <input id="hm-title" className="field-input" type="text" placeholder="e.g. Hiring Manager"
                            value={profile.hiringManagerTitle} onChange={e => setField('hiringManagerTitle', e.target.value)} />
                        </div>
                      </div>
                      <div className="field-group">
                        <label className="field-label" htmlFor="hm-email">Work Email</label>
                        <input id="hm-email" className="field-input" type="email" placeholder="e.g. anna@yourcompany.com"
                          value={profile.hiringManagerEmail} onChange={e => setField('hiringManagerEmail', e.target.value)} />
                      </div>
                    </>
                  ) : (
                    <div className="hm-view">
                      <div className="hm-info">
                        <span className="hm-name">{or(profile.hiringManagerName, 'Not set')}</span>
                        <span className="hm-title">{or(profile.hiringManagerTitle, '')}</span>
                        {profile.hiringManagerEmail && (
                          <a href={`mailto:${profile.hiringManagerEmail}`} className="hm-email">{profile.hiringManagerEmail}</a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>{/* end .profile-sections */}
          </div>{/* end .profile-layout */}
        </div>{/* end .page-body */}
      </div>{/* end .main-content */}
    </div>
  );
}