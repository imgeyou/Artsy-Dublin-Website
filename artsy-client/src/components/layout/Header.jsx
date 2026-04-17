import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.png'
import '../../index.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../../context/AuthContext';

function Header() {
    const { dbUser } = useAuth();

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
                    {dbUser && (
                        <Link to="/messages">MESSAGES</Link>
                    )}
                </nav>

                <Link to={dbUser ? "/me" : "/login"} className="header__user-btn">
                    <FontAwesomeIcon icon={faCircleUser} />
                </Link>
            </div>
        </header>
    )
}

export default Header