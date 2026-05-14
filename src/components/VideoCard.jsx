export default function VideoCard({ video }) {
  const { title, category, duration, views, date, thumbnail } = video;

  return (
    <article className="video-card">
      <a href="#" className="video-card-thumb">
        <div className="thumb-bg" style={{ background: thumbnail }} />
        <span className="thumb-play">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </span>
        {duration && <span className="thumb-duration">{duration}</span>}
      </a>
      <div className="video-card-info">
        <span className="video-card-category">{category}</span>
        <a href="#" className="video-card-title">{title}</a>
        <div className="video-card-meta">
          <span>{views}</span>
          <span className="meta-sep">·</span>
          <span>{date}</span>
        </div>
      </div>
    </article>
  );
}
