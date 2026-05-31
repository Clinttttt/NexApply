import { Skeleton } from '../../components/Skeleton';

export function NotificationsSkeleton() {
  return (
    <div style={{ padding: '24px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
            <Skeleton width="40px" height="40px" style={{ borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <Skeleton height="18px" width="80%" />
              <Skeleton height="14px" width="60%" style={{ marginTop: '8px' }} />
              <Skeleton height="12px" width="30%" style={{ marginTop: '8px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
