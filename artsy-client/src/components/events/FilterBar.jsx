function FilterBar({ activeFilters, setActiveFilters }) {
    const filters = ["All", "Music", "Comedy", "Podcast", "Film"];

    function toggleFilter(filter) {
        if (filter === "All") {
            // 點 All → 清空全部 filter
            setActiveFilters([]);
            return;
        }

        if (activeFilters.includes(filter)) {
            // 移除
            setActiveFilters(activeFilters.filter(f => f !== filter));
        } else {
            // 加入
            setActiveFilters([...activeFilters, filter]);
        }
    }

    return (
        <div className="filter-bar">
            {filters.map((filter) => (
                <button
                    key={filter}
                    className={`filter-btn ${filter === "All"
                        ? activeFilters.length === 0
                            ? "filter-btn--active"
                            : ""
                        : activeFilters.includes(filter)
                            ? "filter-btn--active"
                            : ""
                        }`}
                    onClick={() => toggleFilter(filter)}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
}

export default FilterBar;