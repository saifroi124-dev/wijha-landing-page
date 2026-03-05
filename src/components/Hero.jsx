export function Hero({ tag, title, titleHighlight, sub }) {
  return (
    <div className="hero">
      <div className="hero-inner">
        <div className="hero-tag">{tag}</div>
        <div className="hero-title">
          {title} <span>{titleHighlight}</span>
        </div>
        <div className="hero-sub">{sub}</div>
      </div>
    </div>
  );
}
