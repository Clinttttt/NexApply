import { Skeleton } from '@/shared/components/Skeleton';

export function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Skeleton height="32px" width="200px" />
        <Skeleton height="16px" width="300px" style={{ marginTop: '8px' }} />
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Skeleton height="20px" width="150px" style={{ marginBottom: '16px' }} />
            <Skeleton height="40px" style={{ marginBottom: '12px' }} />
            <Skeleton height="40px" style={{ marginBottom: '12px' }} />
            <Skeleton height="40px" />
          </div>
        ))}
      </div>
    </div>
  );
}
