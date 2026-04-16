import logo from '../../assets/images/logo.png'

function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner container">

                {/* Col 1: Brand */}
                <div className="footer__brand">
                    <img src={logo} alt="Artsy Dublin" className="footer__logo" />
                    <p className="footer__tagline">
                        Discover arts, culture and events across Dublin — all in one place.
                    </p>
                </div>

                {/* Col 2: Explore */}
                <div className="footer__col">
                    <h4 className="footer__col-title">Explore</h4>
                    <nav className="footer__nav">
                        <a href="/">What's On</a>
                        <a href="#">Exhibitions</a>
                        <a href="#">Film</a>
                        <a href="#">Comedy</a>
                        <a href="#">Music</a>
                    </nav>
                </div>

                {/* Col 3: Company */}
                <div className="footer__col">
                    <h4 className="footer__col-title">Company</h4>
                    <nav className="footer__nav">
                        <a href="/team">Our Team</a>
                        <a href="#">About</a>
                        <a href="#">Contact</a>
                        <a href="#">Privacy Policy</a>
                    </nav>
                </div>

                {/* Col 4: Follow */}
                <div className="footer__col">
                    <h4 className="footer__col-title">Follow Us</h4>
                    <div className="footer__social">
                        <a href="#" aria-label="Instagram" className="footer__social-link">
                            <InstagramIcon />
                            Instagram
                        </a>
                        <a href="#" aria-label="Twitter / X" className="footer__social-link">
                            <XIcon />
                            Twitter / X
                        </a>
                        <a href="#" aria-label="Facebook" className="footer__social-link">
                            <FacebookIcon />
                            Facebook
                        </a>
                    </div>
                </div>

            </div>

            <div className="footer__bottom container">
                <span>© {new Date().getFullYear()} Artsy Dublin. All rights reserved.</span>
                <span>Made with care in Dublin, Ireland</span>
            </div>
        </footer>
    );
}

function InstagramIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
    );
}

export default Footer;
