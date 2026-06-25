import { FILTER_DEFINITIONS } from "../utils/eventUtils";

export default function FilterBar({ activeFilters, onToggleFilter }) {
  return (
    <div className="filter-bar-wrap">
      <div className="filter-bar" role="group" aria-label="Event filters">
        {FILTER_DEFINITIONS.map(({ id, label }) => {
          const active = activeFilters.includes(id);
          return (
            <button
              key={id}
              type="button"
              className={`filter-pill ${active ? "filter-pill--active" : ""}`}
              onClick={() => onToggleFilter(id)}
              aria-pressed={active}
            >
              <span className="filter-pill__label">{label}</span>
              {active && id !== "all" && (
                <span className="filter-pill__check mono" aria-hidden="true">×</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
