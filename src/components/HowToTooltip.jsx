export default function HowToTooltip({ heading, children }) {
  return (
    <div className="how-to-tooltip-wrap">
      <button className="how-to-tooltip-btn" type="button" aria-label="사용방법">?</button>
      <div className="how-to-tooltip-box" role="tooltip">
        <span className="ai-intro-kicker">사용방법</span>
        <strong className="how-to-tooltip-heading">{heading}</strong>
        {children}
      </div>
    </div>
  );
}
