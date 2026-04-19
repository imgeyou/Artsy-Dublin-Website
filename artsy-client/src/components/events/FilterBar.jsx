import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

function FilterBar({
    activeCategories,
    setActiveCategories,
    activeDate,
    setActiveDate,
    sortOrder,
    setSortOrder,
}) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const filterRef = useRef(null);

    const categories = ["Music", "Arts & Theatre", "Film"];
    const dates = ["Upcoming", "This Week", "This Month"];
    const sorts = ["Soonest", "Latest"];

    function toggleCategory(category) {
        if (activeCategories.includes(category)) {
            setActiveCategories(activeCategories.filter(item => item !== category));
        } else {
            setActiveCategories([...activeCategories, category]);
        }
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="filter-bar" ref={filterRef}>

            {/* CATEGORY */}
            <div className="filter-dropdown">
                <button
                    className={`filter-dropdown__btn ${openDropdown === "category" ? "is-open" : ""}`}
                    onClick={() =>
                        setOpenDropdown(openDropdown === "category" ? null : "category")
                    }
                >
                    <span>
                        {activeCategories.length > 0
                            ? `Category (${activeCategories.length})`
                            : "Category"}
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} className="filter-dropdown__icon" />
                </button>

                {openDropdown === "category" && (
                    <div className="filter-dropdown__menu">
                        {categories.map((category) => (
                            <label key={category} className="filter-option">
                                <input
                                    type="checkbox"
                                    checked={activeCategories.includes(category)}
                                    onChange={() => toggleCategory(category)}
                                />
                                <span>{category}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* DATE */}
            <div className="filter-dropdown">
                <button
                    className={`filter-dropdown__btn ${openDropdown === "date" ? "is-open" : ""}`}
                    onClick={() =>
                        setOpenDropdown(openDropdown === "date" ? null : "date")
                    }
                >
                    <span>{activeDate ? `Date: ${activeDate}` : "Date"}</span>
                    <FontAwesomeIcon icon={faChevronDown} className="filter-dropdown__icon" />
                </button>

                {openDropdown === "date" && (
                    <div className="filter-dropdown__menu">
                        {dates.map((date) => (
                            <label key={date} className="filter-option">
                                <input
                                    type="radio"
                                    name="date"
                                    checked={activeDate === date}
                                    onChange={() => setActiveDate(date)}
                                />
                                <span>{date}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* SORT */}
            <div className="filter-dropdown">
                <button
                    className={`filter-dropdown__btn ${openDropdown === "sort" ? "is-open" : ""}`}
                    onClick={() =>
                        setOpenDropdown(openDropdown === "sort" ? null : "sort")
                    }
                >
                    <span>{sortOrder ? `Sort: ${sortOrder}` : "Sort by"}</span>
                    <FontAwesomeIcon icon={faChevronDown} className="filter-dropdown__icon" />
                </button>

                {openDropdown === "sort" && (
                    <div className="filter-dropdown__menu">
                        {sorts.map((sort) => (
                            <label key={sort} className="filter-option">
                                <input
                                    type="radio"
                                    name="sort"
                                    checked={sortOrder === sort}
                                    onChange={() => setSortOrder(sort)}
                                />
                                <span>{sort}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FilterBar;