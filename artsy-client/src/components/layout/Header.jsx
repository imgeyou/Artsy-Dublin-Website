import { useState, useRef, useEffect } from "react";
import logo from "../../assets/images/logo.png";
import "../../index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faCircleUser,
    faBars,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Header({ searchTerm = "", setSearchTerm = () => { } }) {
    const { dbUser, refreshAuth } = useAuth();
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const menuRef = useRef(null);
    const mobileNavRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }

            if (mobileNavRef.current && !mobileNavRef.current.contains(e.target)) {
                const burgerBtn = document.querySelector(".header__burger");
                if (burgerBtn && !burgerBtn.contains(e.target)) {
                    setMobileNavOpen(false);
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setMenuOpen(false);
        setMobileNavOpen(false);

        try {
            await fetch("/api/sessionLogout", {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // ignore
        }

        await refreshAuth();
        navigate("/");
    };

    const closeMobileMenu = () => {
        setMobileNavOpen(false);
    };

    return (
        <header className="header">
            <Link to="/" className="header_logo">
                <img src={logo} alt="Artsy Dublin logo" />
            </Link>

            <button
                type="button"
                className="header__burger"
                aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen((prev) => !prev)}
            >
                <FontAwesomeIcon icon={mobileNavOpen ? faXmark : faBars} />
            </button>

            <div
                className={`header-inner ${mobileNavOpen ? "is-open" : ""}`}
                ref={mobileNavRef}
            >
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search events, venues, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-bar__input"
                    />
                    <button type="button" className="search-bar__button" aria-label="Search">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                </div>

                <nav className="header__nav">
                    <Link to="/events" onClick={closeMobileMenu}>ALL EVENTS</Link>
                    <Link to="/posts" onClick={closeMobileMenu}>COMMUNITY</Link>
                    <Link to="/messages" onClick={closeMobileMenu}>MESSAGE</Link>
                    <Link to="/team" onClick={closeMobileMenu}>TEAM</Link>
                </nav>

                {dbUser ? (
                    <div className="header__user-wrap" ref={menuRef}>
                        <button
                            type="button"
                            className="header__user-btn"
                            onClick={() => setMenuOpen((o) => !o)}
                            title={dbUser.userName}
                        >
                            {dbUser.avatarUrl ? (
                                <img
                                    src={dbUser.avatarUrl}
                                    alt={dbUser.userName}
                                    className="header__user-avatar"
                                />
                            ) : (
                                <span className="header__user-initials">
                                    {dbUser.userName?.[0]?.toUpperCase() ?? "?"}
                                </span>
                            )}
                        </button>

                        {menuOpen && (
                            <div className="header__dropdown">
                                <Link
                                    to="/profile"
                                    className="header__dropdown-item"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setMobileNavOpen(false);
                                    }}
                                >
                                    My Profile
                                </Link>
                                <button
                                    type="button"
                                    className="header__dropdown-item header__dropdown-item--logout"
                                    onClick={handleLogout}
                                >
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="header__user-btn"
                        title="Login"
                        onClick={closeMobileMenu}
                    >
                        <FontAwesomeIcon icon={faCircleUser} />
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Header;