import { useState, useRef, useEffect } from "react";
import logo from "../../assets/images/logo.png";
import "../../index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faBars,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import AnimatedTextLink from "../ui/AnimatedTextLink";
import { useAuth } from "../../context/AuthContext";

function Header({ inputValue, setInputValue, onSearch }) {
    const { dbUser, refreshAuth } = useAuth();
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

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
            await fetch("/ad-auth/sessionLogout", { method: "POST", credentials: "include" });
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
        <header className={`header${scrolled ? " header--scrolled" : ""}`}>
            <Link to="/" className="header_logo header_logo--hoverable">
                <img src={logo} alt="Artsy Dublin logo" />
                <span className="header_logo__tooltip">← Back to Homepage</span>
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
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                onSearch();
                            }
                        }}
                        className="search-bar__input"
                        placeholder="Search events..."
                    />
                    <button type="button" onClick={onSearch} className="search-bar__button" aria-label="Search">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                </div>

                <nav className="header__nav">
                    <AnimatedTextLink to="/events" text="ALL EVENTS" />
                    <AnimatedTextLink to="/posts" text="COMMUNITY" />
                    <AnimatedTextLink to={dbUser !== null ? "/messages" : "/login"} text="MESSAGE" />
                    <AnimatedTextLink to="/team" text="TEAM" />
                </nav>

                {dbUser?.userName ? (
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
                        className="header__signin-btn"
                        onClick={closeMobileMenu}
                    >
                        Sign in
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Header;