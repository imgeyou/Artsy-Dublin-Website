import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import '../styles/pages/not-found.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <Header />
      <main className="not-found-main">
        <div className="not-found-bg-text">404</div>
        <div className="not-found-content">
          <p className="not-found-label">PAGE NOT FOUND</p>
          <h1 className="not-found-title">Looks like this<br />page got lost<br />in Dublin.</h1>
          <p className="not-found-sub">The link you followed doesn't lead anywhere.</p>
          <Link to="/" className="not-found-btn">BACK TO HOME →</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
