import { Skeleton } from '@/shared/components/Skeleton';

export function BrowseJobsSkeleton() {
  return (
    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Skeleton width="60px" height="60px" style={{ borderRadius: '12px', marginBottom: '16px' }} />
          <Skeleton height="22px" width="80%" style={{ marginBottom: '8px' }} />
          <Skeleton height="18px" width="60%" style={{ marginBottom: '16px' }} />
          <Skeleton height="16px" width="100%" style={{ marginBottom: '8px' }} />
          <Skeleton height="16px" width="90%" style={{ marginBottom: '16px' }} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Skeleton width="70px" height="24px" style={{ borderRadius: '12px' }} />
            <Skeleton width="70px" height="24px" style={{ borderRadius: '12px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
