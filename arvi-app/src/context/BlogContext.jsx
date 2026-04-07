import React, { createContext, useContext, useState, useEffect } from 'react';

const BlogContext = createContext();

const initialPosts = [
    {
        id: 1,
        slug: 'normativa-accessibilitat-2026',
        title: "Nova normativa d'accessibilitat en comunitats 2026",
        excerpt: "Tots els edificis construïts abans del 2010 hauran d'adaptar els accessos comuns antes del 2026...",
        content: `La Generalitat ha aprovat una nova normativa que obliga totes les comunitats de propietaris a garantir l'accessibilitat universal en els accessos als edificis. 

Les principals actuacions seran:
- Instal·lació de rampes reglamentàries (mínim 1.20m d'amplada).
- Instal·lació d'elevadors o plataformes salvaescales.
- Millora de la il·luminació en zones comunes.

A ARVI Manteniments t'ajudem amb tota la tramitació de subvencions i l'execució de l'obra per complir amb la llei sense ensurts.`,
        category: 'Normativa',
        tags: ['normativa', 'accessibilitat', 'comunitats'],
        author: 'Jaume Aranda',
        status: 'published',
        date: '2026-03-15',
        readTime: '5 min',
        image: 'https://images.unsplash.com/photo-1570171836350-1c7ecf2af50e?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 2,
        slug: 'reduir-consum-energetic-comunitat',
        title: 'Com reduir el consum energètic de la teva comunitat',
        excerpt: 'Una revisió periòdica de les instal·laciones pot suposar un estalvi de fins al 30% en la factura...',
        content: `L'escalada dels preus de l'energia ha fet que moltes comunitats es preguntin com poden estalviar. Aquí teniu unes recomanacions pràctiques:

1. **Il·luminació LED**: Canviar totes les bombetes de les zones comunes i instal·lar sensors de moviment.
2. **Revisió de calderes**: Un manteniment periòdic assegura que el sistema funciona amb la màxima eficiència.
3. **Aïllament tèrmic**: Revisar portes i finestres de les zones comunes per evitar pèrdues de calor.

El nostre servei de manteniment preventiu inclou una auditoria energètica periòdica per optimitzar la teva despesa.`,
        category: 'Consell',
        tags: ['estalvi', 'energia', 'manteniment'],
        author: 'Marc Sánchez',
        status: 'published',
        date: '2026-03-10',
        readTime: '3 min',
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 3,
        slug: 'per-que-digitalitzar-gestio-finca',
        title: 'Per què digitalitzar la gestió de la teva finca',
        excerpt: "El Portal del Veí d'ARVI permet als residents reportar incidències en temps real i veure el seguiment...",
        content: `La transparència és la clau de la bona convivència en una comunitat. Digitalitzar la gestió permet:

- **Comunicació directa**: Reportar avaries en un clic des del mòbil.
- **Transparència total**: Accedir als pressupostos i factures en qualsevol moment.
- **Estalvi de temps**: Evitar esperes i trucades innecessàries al administrador.

A ARVI hem desenvolupat el Portal del Veí amb les últimes tecnologies per connectar millor als propietaris amb el seu equip de manteniment.`,
        category: 'Tech',
        tags: ['digitalització', 'gestió', 'transparència'],
        author: 'Marta Solano',
        status: 'published',
        date: '2026-03-05',
        readTime: '4 min',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    }
];

export const BlogProvider = ({ children }) => {
    const [posts, setPosts] = useState(() => {
        const saved = localStorage.getItem('arvi-posts');
        return saved ? JSON.parse(saved) : initialPosts;
    });

    useEffect(() => {
        localStorage.setItem('arvi-posts', JSON.stringify(posts));
    }, [posts]);

    const addPost = (post) => {
        setPosts(prev => [...prev, { ...post, id: Date.now() }]);
    };

    const updatePost = (id, updatedPost) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updatedPost } : p));
    };

    const deletePost = (id) => {
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    const getPostBySlug = (slug) => {
        return posts.find(p => p.slug === slug || p.id.toString() === slug);
    };

    return (
        <BlogContext.Provider value={{
            posts,
            addPost,
            updatePost,
            deletePost,
            getPostBySlug,
            setPosts
        }}>
            {children}
        </BlogContext.Provider>
    );
};

export const useBlog = () => {
    const context = useContext(BlogContext);
    if (!context) {
        throw new Error('useBlog must be used within a BlogProvider');
    }
    return context;
};
