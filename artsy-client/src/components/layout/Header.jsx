import { useState, useRef, useEffect } from "react";
import logo from '../../assets/images/logo.png'
import '../../index.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Header() {
    const { dbUser, refreshAuth } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setMenuOpen(false);
        try {
            await fetch("/api/sessionLogout", { method: "POST", credentials: "include" });
        } catch {
            // ignore network errors, still clear local state
        }
        await refreshAuth();
        navigate("/");
    };

    return (
        <header className="header">
            <Link to="/" className="header_logo">
                <img src={logo} alt="Artsy Dublin logo" />
            </Link>

            <div className="header-inner">
                <div className="search-bar">
                    <input
                        type="text"
                        className="search-bar__input"
                        placeholder="Search events, artists, categories..."
                    />
                    <button className="search-bar__button" aria-label="Search">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                </div>

                <nav className="header__nav">
                    <a href="#">ALL EVENTS</a>
                    <a href="#">COMMUNITY</a>
                    <a href="#">MESSAGE</a>
                </nav>

                {dbUser ? (
                    <div className="header__user-wrap" ref={menuRef}>
                        <button
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
                                    onClick={() => setMenuOpen(false)}
                                >
                                    My Profile
                                </Link>
                                <button
                                    className="header__dropdown-item header__dropdown-item--logout"
                                    onClick={handleLogout}
                                >
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="header__user-btn" title="Login">
                        <FontAwesomeIcon icon={faCircleUser} />
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Header;
