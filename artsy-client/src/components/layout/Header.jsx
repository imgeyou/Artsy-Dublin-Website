import logo from '../../assets/images/logo.png'
import '../../index.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

function Header() {
    return (
        <header className="header">
            <a href="/" className="header_logo">
                <img src={logo} alt="Artsy Dublin logo" />
            </a>

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

                <button className="header__user-btn">
                    <FontAwesomeIcon icon={faCircleUser} />
                </button>
            </div>
        </header>
    )
}

export default Header