import React from 'react';
import { MapPinned, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SeoHead } from '../../components/SEO/SeoHead';

const AREAS = [
  {
    province: 'Barcelona',
    zones: ['Sabadell', 'Terrassa', 'Barcelona ciutat', 'Mataro', 'Granollers', 'Sant Cugat']
  },
  {
    province: 'Girona',
    zones: ['Girona', 'Figueres', 'Blanes', 'Lloret de Mar', 'Olot', 'Palamos']
  },
  {
    province: 'Lleida',
    zones: ['Lleida', 'Balaguer', 'Tremp', 'La Seu dUrgell', 'Tarrega', 'Mollerussa']
  },
  {
    province: 'Tarragona',
    zones: ['Tarragona', 'Reus', 'Valls', 'Cambrils', 'Salou', 'El Vendrell']
  }
];

export const CoverageCatalunya = () => {
  const navigate = useNavigate();

  return (
    <section className="full-section">
      <SeoHead
        title="Cobertura de serveis a Catalunya | ARVI"
        description="Cobertura de manteniment integral, reformes i incidencies a Barcelona, Girona, Lleida i Tarragona. Servei rapid i equips especialitzats."
        path="/cobertura-catalunya"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Manteniment integral a Catalunya',
          areaServed: ['Barcelona', 'Girona', 'Lleida', 'Tarragona'],
          provider: {
            '@type': 'LocalBusiness',
            name: 'ARVI Manteniments Integrals'
          }
        }}
      />
      <div className="section-inner">
        <MapPinned size={48} className="section-icon" />
        <h1 className="section-title">Cobertura de serveis a tota Catalunya</h1>
        <p className="section-subtitle">Operem amb equips propis i col-laboradors homologats a les 4 provincies de Catalunya.</p>

        <div className="coverage-grid" style={{ marginBottom: '2.5rem' }}>
          {AREAS.map((area) => (
            <article key={area.province} className="coverage-card" style={{ cursor: 'default' }}>
              <h2 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>{area.province}</h2>
              {area.zones.map((zone) => (
                <p key={zone} style={{ margin: '0.35rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <CheckCircle size={14} color="var(--brand-green)" /> {zone}
                </p>
              ))}
            </article>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="nav-btn contact" onClick={() => navigate('/contacto')}>
            Sollicita pressupost per la teva zona
          </button>
        </div>
      </div>
    </section>
  );
};
