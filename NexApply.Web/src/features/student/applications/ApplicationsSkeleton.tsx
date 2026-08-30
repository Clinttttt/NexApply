import { Skeleton } from '@/shared/components/Skeleton';

export function ApplicationsSkeleton() {
  return (
    <div style={{ padding: '24px' }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Skeleton width="50px" height="50px" style={{ borderRadius: '8px' }} />
            <div style={{ flex: 1 }}>
              <Skeleton height="20px" width="60%" />
              <Skeleton height="16px" width="40%" style={{ marginTop: '8px' }} />
            </div>
            <Skeleton width="100px" height="32px" style={{ borderRadius: '16px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
