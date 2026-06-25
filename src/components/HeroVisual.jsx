/** Static hero visual — CD reference (no animation) */
export default function HeroVisual() {
  return (
    <picture className="hero-visual">
      <source srcSet="/images/hero-main-flow.webp" type="image/webp" />
      <img
        className="hero-visual__img"
        src="/images/hero-main-flow.jpg"
        alt=""
        width={1774}
        height={887}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
    </picture>
  );
}
