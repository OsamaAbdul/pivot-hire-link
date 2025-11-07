import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="nf-footer" role="contentinfo">
      <div className="container mx-auto px-6">
        <div className="nf-wrap">
          <p className="nf-copy">© 2024 Northern Founders Community. All rights reserved.</p>
          <nav aria-label="Footer navigation">
            <div className="nf-group" aria-label="Social links">
              <a href="https://x.com/nfcommunity_?lang=en" target="_blank" rel="noopener noreferrer">X</a>
              <a href="https://ng.linkedin.com/company/northern-founders-community" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://www.instagram.com/northernfounderscommunity_/?hl=en" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="mailto:contact@northernfounders.org">Contact</a>
            </div>
            <div className="nf-group" aria-label="Legal links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;