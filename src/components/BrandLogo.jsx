export default function BrandLogo({ className = "" }) {
  return (
    <span className={`brand-logo ${className}`.trim()} aria-label="MainTech OS">
      <span className="brand-logo__word">
        <span className="brand-logo__cap">M</span>
        ain
        <span className="brand-logo__cap">T</span>
        ech
      </span>
      <span className="brand-logo__os">OS</span>
    </span>
  );
}
