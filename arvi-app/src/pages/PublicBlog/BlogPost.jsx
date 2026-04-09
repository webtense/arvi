import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User, Clock, Calendar, Tag, Share2, Facebook, Twitter, Linkedin, Building2, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBlog } from '../../context/BlogContext';
import { SeoHead } from '../../components/SEO/SeoHead';
import './Blog.css';

export const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { getPostBySlug, posts } = useBlog();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const p = getPostBySlug(slug);
        if (p) {
            setPost(p);
            window.scrollTo(0, 0);
        } else {
            // Check if slug is actually ID
            const byId = posts.find(p => p.id.toString() === slug);
            if (byId) {
                setPost(byId);
                window.scrollTo(0, 0);
            } else {
                navigate('/blog');
            }
        }
    }, [slug, posts, getPostBySlug, navigate]);

    if (!post) return <div className="loading">{t('blog.loading')}</div>;

    const relatedPosts = posts.filter(p => p.id !== post.id && p.status === 'published').slice(0, 3);

    return (
        <section className="full-section">
            <SeoHead
                title={`${post.title} | Blog ARVI`}
                description={post.excerpt || 'Article del blog dARVI sobre manteniment i reformes a Catalunya.'}
                path={`/blog/${post.slug || post.id}`}
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'BlogPosting',
                    headline: post.title,
                    datePublished: post.date,
                    author: {
                        '@type': 'Person',
                        name: post.author || 'ARVI'
                    },
                    publisher: {
                        '@type': 'Organization',
                        name: 'ARVI Manteniments Integrals'
                    }
                }}
            />
            <div className="section-inner">
                <article className="blog-article-full">
                    <header className="article-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div className="blog-tag">{post.category}</div>
                        <h1 className="article-title" style={{ fontSize: '3rem', margin: '1rem 0' }}>{post.title}</h1>
                        <div className="article-meta" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: 'var(--text-muted)' }}>
                            <span><User size={16} /> {post.author}</span>
                            <span><Calendar size={16} /> {post.date}</span>
                            <span><Clock size={16} /> {post.readTime}</span>
                        </div>
                    </header>

                    <div className="article-featured-image" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '3rem' }}>
                        <img 
                            src={post.image || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop'} 
                            alt={post.title} 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div className="article-content" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
                        {post.content.split('\n\n').map((para, i) => (
                            <p key={i} style={{ marginBottom: '1.5rem' }}>{para}</p>
                        ))}
                    </div>

                    <div className="article-footer" style={{ maxWidth: '800px', margin: '4rem auto 0', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                        <div className="tags" style={{ display: 'flex', gap: '0.5rem' }}>
                            {post.tags.map(tag => (
                                <span key={tag} className="blog-tag">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </article>

                {relatedPosts.length > 0 && (
                    <div className="related-section" style={{ marginTop: '6rem' }}>
                        <h3 className="section-title">{t('blog.related')}</h3>
                        <div className="blog-grid" style={{ marginTop: '2rem' }}>
                            {relatedPosts.map(rp => (
                                <div 
                                    key={rp.id} 
                                    className="blog-card"
                                    onClick={() => navigate(`/blog/${rp.slug || rp.id}`)}
                                >
                                    <span className="blog-tag">{rp.category}</span>
                                    <h4>{rp.title}</h4>
                                    <span className="card-link">{t('blog.readArticle')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
