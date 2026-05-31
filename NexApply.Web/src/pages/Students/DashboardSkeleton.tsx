import { Skeleton } from '../../components/Skeleton';
import './StudentDashboard.css';

export function DashboardSkeleton() {
  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card">
            <Skeleton height="24px" width="60px" />
            <Skeleton height="40px" width="80px" style={{ marginTop: '8px' }} />
            <Skeleton height="16px" width="100px" style={{ marginTop: '4px' }} />
          </div>
        ))}
      </div>

      <div className="main-row">
        <div className="panel">
          <div className="panel-header">
            <Skeleton height="24px" width="200px" />
          </div>
          <div style={{ padding: '24px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                <Skeleton width="48px" height="48px" style={{ borderRadius: '8px' }} />
                <div style={{ flex: 1 }}>
                  <Skeleton height="18px" width="70%" />
                  <Skeleton height="14px" width="50%" style={{ marginTop: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <Skeleton height="24px" width="180px" />
          </div>
          <div style={{ padding: '24px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <Skeleton height="20px" width="80%" />
                <Skeleton height="16px" width="60%" style={{ marginTop: '8px' }} />
                <Skeleton height="14px" width="40%" style={{ marginTop: '8px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="panel panel--compact">
          <div className="panel-header">
            <Skeleton height="20px" width="150px" />
          </div>
          <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Skeleton width="100px" height="100px" style={{ borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height="16px" style={{ marginBottom: '12px' }} />
              ))}
            </div>
          </div>
        </div>

        <div className="panel panel--compact">
          <div className="panel-header">
            <Skeleton height="20px" width="120px" />
          </div>
          <div style={{ padding: '16px' }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="60px" style={{ marginBottom: '12px', borderRadius: '8px' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
