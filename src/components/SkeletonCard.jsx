/**
 * Skeleton placeholder card matching ImageCard proportions.
 * @param {number} height - card height in px
 */
export default function SkeletonCard({ height = 300 }) {
  return (
    <div
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(20,25,35,0.85)',
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '16px',
      }}
    >
      {/* Image placeholder */}
      <div className="shimmer" style={{ height: `${Math.round(height * 0.65)}px`, width: '100%' }} />

      {/* Text placeholders */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="shimmer" style={{ height: '14px', width: '72%', borderRadius: '8px' }} />
        <div className="shimmer" style={{ height: '11px', width: '48%', borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <div className="shimmer" style={{ height: '22px', width: '60px', borderRadius: '999px' }} />
          <div className="shimmer" style={{ height: '22px', width: '48px', borderRadius: '999px' }} />
        </div>
      </div>
    </div>
  );
}
