import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Clock, Tag, User, BookOpen, Building2 } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import './Blog.css';

export const BlogList = () => {
    const navigate = useNavigate();
    const { posts } = useBlog();
    const [search, setSearch] = useState('');

    const publishedPosts = posts.filter(p => p.status === 'published');
    const filtered = publishedPosts.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.excerpt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="public-blog-page">
            <section className="full-section">
                <div className="section-inner">
                    <BookOpen size={48} className="section-icon" />
                    <h2 className="section-title">{t('blog.title')}</h2>
                    <p className="section-subtitle">{t('blog.subtitle')}</p>

                    <div className="blog-controls" style={{ marginBottom: '3rem' }}>
                        <div className="search-bar">
                            <Search size={20} />
                            <input 
                                type="text" 
                                placeholder={t('blog.search')} 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="no-posts" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                            <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>{t('blog.noPosts')}</p>
                        </div>
                    ) : (
                        <div className="blog-grid">
                            {filtered.map(post => (
                                <div 
                                    key={post.id} 
                                    className="blog-card"
                                    onClick={() => navigate(`/blog/${post.slug || post.id}`)}
                                >
                                    <span className="blog-tag">{post.category}</span>
                                    <h4>{post.title}</h4>
                                    <p>{post.excerpt}</p>
                                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <span><User size={12} /> {post.author}</span>
                                        <span>{post.date}</span>
                                    </div>
                                    <span className="card-link" style={{ marginTop: '1rem' }}>{t('blog.readArticle')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="cta-section">
                <h3>{t('blog.subscribe.title')}</h3>
                <p>{t('blog.subscribe.subtitle')}</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
                    <input type="email" placeholder={t('blog.subscribe.placeholder')} style={{ padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', flex: 1 }} />
                    <button className="nav-btn primary">{t('blog.subscribe.button')}</button>
                </div>
            </section>
        </div>
    );
};
