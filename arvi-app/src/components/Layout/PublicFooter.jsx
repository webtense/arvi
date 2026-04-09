import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>ARVI Manteniments Integrals</h4>
          <p>
            Empresa especialitzada en manteniment integral, incidencies i reformes per comunitats de veins,
            locals i pimes a tota Catalunya.
          </p>
        </div>

        <div className="footer-col">
          <h4>Enllacos utils</h4>
          <ul>
            <li><Link to="/">Inici</Link></li>
            <li><Link to="/cobertura-catalunya">Cobertura Catalunya</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/politica-cookies">Politica de cookies</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contacte</h4>
          <ul>
            <li><a href="tel:+34669475583">+34 669 47 55 83</a></li>
            <li><a href="mailto:info@arvimanteniment.com">info@arvimanteniment.com</a></li>
            <li>C/ Sentmenat, 5, Sabadell (Barcelona)</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright {new Date().getFullYear()} ARVI - Servei a tota Catalunya.</p>
      </div>
    </footer>
  );
};
