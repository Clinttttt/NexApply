import './Skeleton.css';

export const Skeleton = ({ width, height, className = '' }: { width?: string; height?: string; className?: string }) => (
  <div className={`skeleton ${className}`} style={{ width, height }} />
);

export const SkeletonText = ({ lines = 1 }: { lines?: number }) => (
  <div className="skeleton-text">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height="16px" />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton height="120px" />
    <div style={{ padding: '16px' }}>
      <Skeleton height="20px" width="70%" />
      <Skeleton height="16px" width="50%" style={{ marginTop: '8px' }} />
    </div>
  </div>
);
