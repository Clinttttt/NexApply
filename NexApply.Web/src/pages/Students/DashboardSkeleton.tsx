import { Skeleton } from '../../components/Skeleton';

export function DashboardSkeleton() {
  return (
    <>
      <div className="activity-banner">
        <div className="banner-pipeline">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bp-item">
              <Skeleton height="32px" width="60px" />
              <Skeleton height="14px" width="80px" style={{ marginTop: '4px' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="main-row">
        <div className="panel">
          <div className="panel-header">
            <Skeleton height="20px" width="180px" />
          </div>
          <div style={{ padding: '20px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <Skeleton width="48px" height="48px" style={{ borderRadius: '8px' }} />
                <div style={{ flex: 1 }}>
                  <Skeleton height="16px" width="70%" />
                  <Skeleton height="14px" width="50%" style={{ marginTop: '6px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <Skeleton height="20px" width="150px" />
          </div>
          <div style={{ padding: '20px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <Skeleton height="18px" width="80%" />
                <Skeleton height="14px" width="60%" style={{ marginTop: '8px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="panel panel--compact">
          <div className="panel-header">
            <Skeleton height="18px" width="140px" />
          </div>
          <div style={{ padding: '20px' }}>
            <Skeleton height="14px" width="90%" />
            <Skeleton height="14px" width="80%" style={{ marginTop: '8px' }} />
          </div>
        </div>

        <div className="panel panel--compact">
          <div className="panel-header">
            <Skeleton height="18px" width="120px" />
          </div>
          <div style={{ padding: '20px' }}>
            <Skeleton height="14px" width="85%" />
            <Skeleton height="14px" width="75%" style={{ marginTop: '8px' }} />
          </div>
        </div>
      </div>
    </>
  );
}
