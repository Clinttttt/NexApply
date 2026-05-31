import { Skeleton } from '../../components/Skeleton';

export function SavedJobsSkeleton() {
  return (
    <div style={{ padding: '24px' }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Skeleton width="60px" height="60px" style={{ borderRadius: '8px' }} />
            <div style={{ flex: 1 }}>
              <Skeleton height="20px" width="70%" />
              <Skeleton height="16px" width="50%" style={{ marginTop: '8px' }} />
              <Skeleton height="14px" width="40%" style={{ marginTop: '8px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
