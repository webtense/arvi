import { useEffect } from 'react';

const upsertByName = (name, content) => {
  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertByProperty = (property, content) => {
  let tag = document.head.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertLink = (rel, href) => {
  let link = document.head.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const upsertJsonLd = (id, json) => {
  let script = document.head.querySelector(`script[data-seo-id="${id}"]`);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-id', id);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(json);
};

export const SeoHead = ({ title, description, path = '/', robots = 'index,follow', jsonLd }) => {
  useEffect(() => {
    const canonicalUrl = `https://arvimanteniment.com${path}`;
    document.title = title;

    upsertByName('description', description);
    upsertByName('robots', robots);
    upsertByName('twitter:card', 'summary_large_image');
    upsertByName('twitter:title', title);
    upsertByName('twitter:description', description);

    upsertByProperty('og:type', 'website');
    upsertByProperty('og:site_name', 'ARVI Manteniments Integrals');
    upsertByProperty('og:title', title);
    upsertByProperty('og:description', description);
    upsertByProperty('og:url', canonicalUrl);

    upsertLink('canonical', canonicalUrl);

    if (jsonLd) {
      upsertJsonLd('page-jsonld', jsonLd);
    }
  }, [title, description, path, robots, jsonLd]);

  return null;
};
