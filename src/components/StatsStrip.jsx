export default function StatsStrip({ stats }) {
  return (
    <div className="stats-strip mono" aria-label="Platform statistics">
      <span>upcoming:{stats.upcoming}</span>
      <span className="stats-strip__sep" aria-hidden="true">|</span>
      <span>archive:{stats.archive}</span>
      <span className="stats-strip__sep" aria-hidden="true">|</span>
      <span>topics:{stats.topics}</span>
      <span className="stats-strip__sep" aria-hidden="true">|</span>
      <span>free:{stats.free}</span>
      <span className="stats-strip__sep" aria-hidden="true">|</span>
      <span>saved:{stats.saved}</span>
    </div>
  );
}
