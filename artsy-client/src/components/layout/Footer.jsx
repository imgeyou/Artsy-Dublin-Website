import logo from '../../assets/images/logo.png'

function Footer() {
    return (
        <footer className="footer">
            <div className="footer_cta">
                <h2 className="footer_title">Request More Information</h2>
                <p className="footer_text">
                    Lift Media, LLC is a clinical stage healthcare company which is developing a unique.
                </p>
                <button className="footer_btn">Contact Us</button>
            </div>

            <div className="footer_main container">
                <div className="footer_logo">
                    <img src={logo} alt="logo" />
                </div>

                <nav className="footer_nav">
                    <a href="#">Team</a>
                    <a href="#">Case Studies</a>
                    <a href="#">Publications</a>
                </nav>

                <div className="footer_social">
                    <span>🔗</span>
                    <span>🔗</span>
                    <span>🔗</span>
                </div>
            </div>

            <div className="footer_bottom">
                © 2019 Bostel, LLC
            </div>
        </footer>
    )
}

export default Footer