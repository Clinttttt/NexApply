import './CompanyProfile.css';

export function CompanyProfileSkeleton() {
  return (
    <div className="profile-layout">
      {/* Left Preview Card Skeleton */}
      <aside className="profile-preview">
        <div className="preview-card">
          <div className="preview-card-header">
            <div className="skeleton skeleton-text" style={{ width: '120px', height: '12px' }} />
            <div className="skeleton skeleton-text" style={{ width: '180px', height: '10px', marginTop: '4px' }} />
          </div>

          <div className="preview-logo-wrap">
            <div className="skeleton skeleton-circle" style={{ width: '96px', height: '96px' }} />
          </div>

          <div className="preview-body">
            <div className="skeleton skeleton-text" style={{ width: '160px', height: '20px', marginBottom: '8px' }} />
            <div className="skeleton skeleton-text" style={{ width: '200px', height: '14px', marginBottom: '16px' }} />

            <div className="preview-meta" style={{ gap: '8px', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div className="skeleton skeleton-text" style={{ width: '140px', height: '12px' }} />
              <div className="skeleton skeleton-text" style={{ width: '120px', height: '12px' }} />
              <div className="skeleton skeleton-text" style={{ width: '100px', height: '12px' }} />
            </div>

            <div className="preview-listings" style={{ marginTop: '16px' }}>
              <div className="skeleton skeleton-text" style={{ width: '60px', height: '24px' }} />
            </div>
          </div>

          <div className="preview-perks" style={{ gap: '8px' }}>
            <div className="skeleton skeleton-pill" style={{ width: '80px', height: '24px' }} />
            <div className="skeleton skeleton-pill" style={{ width: '100px', height: '24px' }} />
            <div className="skeleton skeleton-pill" style={{ width: '90px', height: '24px' }} />
          </div>
        </div>
      </aside>

      {/* Right Profile Sections Skeleton */}
      <div className="profile-sections">
        {/* Card 1 */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-header-left">
              <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }} />
              <div>
                <div className="skeleton skeleton-text" style={{ width: '140px', height: '16px', marginBottom: '4px' }} />
                <div className="skeleton skeleton-text" style={{ width: '200px', height: '12px' }} />
              </div>
            </div>
            <div className="skeleton skeleton-button" style={{ width: '110px', height: '36px' }} />
          </div>
          <div className="profile-card-body">
            <div className="view-info-grid">
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <div className="skeleton skeleton-text" style={{ width: '100px', height: '12px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '160px', height: '12px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-header-left">
              <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }} />
              <div>
                <div className="skeleton skeleton-text" style={{ width: '160px', height: '16px', marginBottom: '4px' }} />
                <div className="skeleton skeleton-text" style={{ width: '240px', height: '12px' }} />
              </div>
            </div>
          </div>
          <div className="profile-card-body">
            <div className="view-text-block">
              <div className="skeleton skeleton-text" style={{ width: '80px', height: '12px', marginBottom: '8px' }} />
              <div className="skeleton skeleton-text" style={{ width: '100%', height: '12px', marginBottom: '6px' }} />
              <div className="skeleton skeleton-text" style={{ width: '100%', height: '12px', marginBottom: '6px' }} />
              <div className="skeleton skeleton-text" style={{ width: '80%', height: '12px' }} />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-header-left">
              <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }} />
              <div>
                <div className="skeleton skeleton-text" style={{ width: '120px', height: '16px', marginBottom: '4px' }} />
                <div className="skeleton skeleton-text" style={{ width: '220px', height: '12px' }} />
              </div>
            </div>
          </div>
          <div className="profile-card-body">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton skeleton-pill" style={{ width: `${80 + (i * 10)}px`, height: '28px' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-header-left">
              <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }} />
              <div>
                <div className="skeleton skeleton-text" style={{ width: '140px', height: '16px', marginBottom: '4px' }} />
                <div className="skeleton skeleton-text" style={{ width: '260px', height: '12px' }} />
              </div>
            </div>
          </div>
          <div className="profile-card-body">
            <div className="view-info-grid">
              {[...Array(2)].map((_, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <div className="skeleton skeleton-text" style={{ width: '80px', height: '12px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '180px', height: '12px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-header-left">
              <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }} />
              <div>
                <div className="skeleton skeleton-text" style={{ width: '130px', height: '16px', marginBottom: '4px' }} />
                <div className="skeleton skeleton-text" style={{ width: '240px', height: '12px' }} />
              </div>
            </div>
          </div>
          <div className="profile-card-body">
            <div className="hm-view">
              <div className="hm-info">
                <div className="skeleton skeleton-text" style={{ width: '140px', height: '16px', marginBottom: '6px' }} />
                <div className="skeleton skeleton-text" style={{ width: '120px', height: '12px', marginBottom: '6px' }} />
                <div className="skeleton skeleton-text" style={{ width: '180px', height: '12px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
