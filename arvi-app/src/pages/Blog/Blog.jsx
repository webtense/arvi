import React, { useState } from 'react';
import { PenSquare, Trash2, Eye, EyeOff, Search, Filter, Plus, Tag, Clock, User, BookOpen, AlertTriangle, X, Save, Send } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import './Blog.css';

const CATEGORIES = ['Todos', 'Noticias', 'Consejos', 'Guías', 'Casos de éxito', 'Empresa'];
const STATUS_OPTIONS = ['Todos', 'published', 'draft'];

const emptyPost = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Noticias',
    tags: '',
    author: 'ARVI Manteniments',
    status: 'draft',
    readTime: '',
    image: '',
};

export const Blog = () => {
    const { posts, addPost, updatePost, deletePost } = useBlog();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [formData, setFormData] = useState(emptyPost);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'preview'
    const [previewPost, setPreviewPost] = useState(null);
    const [aiTopic, setAiTopic] = useState('');
    const [aiTone, setAiTone] = useState('profesional');

    // Filtros aplicados
    const filtered = posts.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.excerpt.toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === 'Todos' || p.category === categoryFilter;
        const matchStatus = statusFilter === 'Todos' || p.status === statusFilter;
        return matchSearch && matchCat && matchStatus;
    });

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        draft: posts.filter(p => p.status === 'draft').length,
    };

    // Abrir modal para crear
    const openCreate = () => {
        setEditingPost(null);
        setFormData(emptyPost);
        setModalOpen(true);
    };

    // Abrir modal para editar
    const openEdit = (post) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            slug: post.slug || '',
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            tags: post.tags.join(', '),
            author: post.author,
            status: post.status,
            readTime: post.readTime,
            image: post.image || '',
        });
        setModalOpen(true);
    };

    // Guardar post (crear o editar)
    const handleSave = (publishNow = false) => {
        const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        const newPost = {
            ...formData,
            tags: tagsArray,
            status: publishNow ? 'published' : formData.status,
            date: new Date().toISOString().split('T')[0],
            readTime: formData.readTime || `${Math.max(1, Math.ceil(formData.content.split(' ').length / 200))} min`,
        };

        if (editingPost) {
            updatePost(editingPost.id, newPost);
        } else {
            addPost(newPost);
        }
        setModalOpen(false);
    };

    const generateWithAI = () => {
        const topic = aiTopic.trim() || formData.title.trim() || 'mantenimiento preventivo en comunidades';
        const title = `Guia practica: ${topic}`;
        const excerpt = `Claves para ${topic} con enfoque ${aiTone}, ahorro de costes y mejor experiencia para comunidades y pymes.`;
        const content = `## Introduccion\n\nEn este articulo explicamos como ${topic} de forma ${aiTone} y orientada a resultados.\n\n## Problemas mas comunes\n\n- Falta de mantenimiento planificado\n- Costes reactivos por averias\n- Tiempos de respuesta altos\n\n## Recomendaciones practicas\n\n1. Define un plan trimestral de revisiones.\n2. Prioriza activos criticos y riesgos de seguridad.\n3. Registra incidencias y horas para medir productividad.\n4. Revisa presupuestos y contratos por proveedor.\n\n## Checklist de accion\n\n- Estado actual de equipos\n- Incidencias abiertas\n- Coste mensual de mantenimiento\n- Proximas acciones por prioridad\n\n## Conclusion\n\nAplicando este enfoque, ARVI puede mejorar servicio, reducir incidencias y aumentar rentabilidad en proyectos de mantenimiento integral.`;

        setFormData((prev) => ({
            ...prev,
            title,
            excerpt,
            content,
            tags: 'mantenimiento, comunidades, eficiencia, ARVI',
            category: prev.category || 'Consejos',
        }));
    };

    // Cambiar estado publicado/borrador
    const toggleStatus = (id) => {
        const post = posts.find(p => p.id === id);
        if (post) {
            updatePost(id, { status: post.status === 'published' ? 'draft' : 'published' });
        }
    };

    // Eliminar post
    const handleDelete = (id) => {
        deletePost(id);
        setDeleteConfirm(null);
    };

    // Previsualizar
    const openPreview = (post) => {
        setPreviewPost(post);
        setActiveTab('preview');
    };

    return (
        <div className="blog-container">
            {/* Header */}
            <div className="blog-header">
                <div>
                    <h2 className="blog-title">
                        <BookOpen size={28} />
                        Gestión de Blog
                    </h2>
                    <p className="blog-subtitle">Crea, edita y publica artículos para tu web</p>
                </div>
                <button className="btn-new-post" onClick={openCreate}>
                    <Plus size={18} />
                    Nuevo artículo
                </button>
            </div>

            {/* Stats Cards */}
            <div className="blog-stats">
                <div className="blog-stat-card">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">Total artículos</span>
                </div>
                <div className="blog-stat-card published">
                    <span className="stat-number">{stats.published}</span>
                    <span className="stat-label">Publicados</span>
                </div>
                <div className="blog-stat-card draft">
                    <span className="stat-number">{stats.draft}</span>
                    <span className="stat-label">Borradores</span>
                </div>
            </div>

            {/* Tabs: Lista / Preview */}
            <div className="blog-tabs">
                <button
                    className={`blog-tab ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    Lista de artículos
                </button>
                {previewPost && (
                    <button
                        className={`blog-tab ${activeTab === 'preview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('preview')}
                    >
                        <Eye size={15} /> Preview: {previewPost.title.substring(0, 30)}...
                        <span className="tab-close" onClick={(e) => { e.stopPropagation(); setPreviewPost(null); setActiveTab('list'); }}><X size={14} /></span>
                    </button>
                )}
            </div>

            {activeTab === 'list' && (
                <>
                    {/* Barra de filtros */}
                    <div className="blog-filters">
                        <div className="search-wrap">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar artículos..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="blog-search"
                            />
                        </div>
                        <div className="filter-group">
                            <Filter size={15} className="filter-icon" />
                            <select
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                className="blog-select"
                            >
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="blog-select"
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>
                                        {s === 'Todos' ? 'Todos los estados' : s === 'published' ? 'Publicados' : 'Borradores'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Grid de Posts */}
                    {filtered.length === 0 ? (
                        <div className="blog-empty">
                            <BookOpen size={48} />
                            <p>No se encontraron artículos con esos filtros.</p>
                            <button className="btn-new-post" onClick={openCreate}><Plus size={16} /> Crear primer artículo</button>
                        </div>
                    ) : (
                        <div className="posts-grid">
                            {filtered.map(post => (
                                <div key={post.id} className={`post-card ${post.status}`}>
                                    <div className="post-card-header">
                                        <div className="post-meta-row">
                                            <span className="post-category">{post.category}</span>
                                            <span className={`post-status-badge ${post.status}`}>
                                                {post.status === 'published' ? '● Publicado' : '○ Borrador'}
                                            </span>
                                        </div>
                                        <h3 className="post-title">{post.title}</h3>
                                        <p className="post-excerpt">{post.excerpt}</p>
                                    </div>

                                    <div className="post-card-footer">
                                        <div className="post-info">
                                            <span className="post-info-item">
                                                <Clock size={13} /> {post.readTime}
                                            </span>
                                            <span className="post-info-item">
                                                <User size={13} /> {post.author}
                                            </span>
                                            <span className="post-info-item">
                                                {post.date}
                                            </span>
                                        </div>
                                        {post.tags.length > 0 && (
                                            <div className="post-tags">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="tag-chip">
                                                        <Tag size={11} /> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="post-actions">
                                            <button
                                                className="action-btn preview"
                                                title="Previsualizar"
                                                onClick={() => openPreview(post)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className={`action-btn toggle ${post.status}`}
                                                title={post.status === 'published' ? 'Pasar a borrador' : 'Publicar'}
                                                onClick={() => toggleStatus(post.id)}
                                            >
                                                {post.status === 'published' ? <EyeOff size={16} /> : <Send size={16} />}
                                            </button>
                                            <button
                                                className="action-btn edit"
                                                title="Editar"
                                                onClick={() => openEdit(post)}
                                            >
                                                <PenSquare size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                title="Eliminar"
                                                onClick={() => setDeleteConfirm(post.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && previewPost && (
                <div className="post-preview">
                    <div className="preview-header">
                        <span className="post-category">{previewPost.category}</span>
                        <h1 className="preview-title">{previewPost.title}</h1>
                        <p className="preview-excerpt">{previewPost.excerpt}</p>
                        <div className="preview-meta">
                            <span><User size={14} /> {previewPost.author}</span>
                            <span><Clock size={14} /> {previewPost.readTime} de lectura</span>
                            <span>{previewPost.date}</span>
                            <span className={`post-status-badge ${previewPost.status}`}>
                                {previewPost.status === 'published' ? '● Publicado' : '○ Borrador'}
                            </span>
                        </div>
                    </div>
                    <div className="preview-divider" />
                    <div className="preview-content">
                        <p>{previewPost.content}</p>
                    </div>
                    {previewPost.tags.length > 0 && (
                        <div className="post-tags" style={{ marginTop: '2rem' }}>
                            {previewPost.tags.map(tag => (
                                <span key={tag} className="tag-chip"><Tag size={11} /> {tag}</span>
                            ))}
                        </div>
                    )}
                    <div className="preview-footer-actions">
                        <button className="btn-secondary" onClick={() => openEdit(previewPost)}>
                            <PenSquare size={16} /> Editar artículo
                        </button>
                        <button
                            className={previewPost.status === 'published' ? 'btn-draft' : 'btn-publish'}
                            onClick={() => { toggleStatus(previewPost.id); setPreviewPost(p => ({ ...p, status: p.status === 'published' ? 'draft' : 'published' })); }}
                        >
                            {previewPost.status === 'published' ? <><EyeOff size={16} /> Pasar a borrador</> : <><Send size={16} /> Publicar</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Crear/Editar */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingPost ? 'Editar artículo' : 'Nuevo artículo'}</h3>
                            <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group full">
                                    <label>Título del artículo *</label>
                                    <input
                                        type="text"
                                        placeholder="Escribe un título atractivo..."
                                        value={formData.title}
                                        onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-row two-col">
                                <div className="form-group">
                                    <label>Slug (URL amigable)</label>
                                    <input
                                        type="text"
                                        placeholder="ej: mi-primer-articulo"
                                        value={formData.slug}
                                        onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>URL de imagen</label>
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/..."
                                        value={formData.image}
                                        onChange={e => setFormData(f => ({ ...f, image: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-row two-col">
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                                        className="form-input"
                                    >
                                        {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Estado</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                                        className="form-input"
                                    >
                                        <option value="draft">Borrador</option>
                                        <option value="published">Publicado</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group full" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', background: 'rgba(56,161,105,0.05)' }}>
                                    <label>Asistente IA para borradores</label>
                                    <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '2fr 1fr auto' }}>
                                        <input
                                            type="text"
                                            placeholder="Tema del articulo (ej: mantenimiento ascensores en comunidades)"
                                            value={aiTopic}
                                            onChange={(e) => setAiTopic(e.target.value)}
                                            className="form-input"
                                        />
                                        <select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className="form-input">
                                            <option value="profesional">Profesional</option>
                                            <option value="cercano">Cercano</option>
                                            <option value="tecnico">Tecnico</option>
                                        </select>
                                        <button className="btn-save-draft" type="button" onClick={generateWithAI}>Generar borrador IA</button>
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group full">
                                    <label>Resumen / Extracto *</label>
                                    <textarea
                                        placeholder="Escribe un breve resumen del artículo (se mostrará en la lista)..."
                                        value={formData.excerpt}
                                        onChange={e => setFormData(f => ({ ...f, excerpt: e.target.value }))}
                                        className="form-input"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group full">
                                    <label>Contenido del artículo *</label>
                                    <textarea
                                        placeholder="Escribe aquí el contenido completo del artículo..."
                                        value={formData.content}
                                        onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
                                        className="form-input content-editor"
                                        rows={12}
                                    />
                                </div>
                            </div>
                            <div className="form-row two-col">
                                <div className="form-group">
                                    <label>Tags (separados por comas)</label>
                                    <input
                                        type="text"
                                        placeholder="mantenimiento, consejos, empresa..."
                                        value={formData.tags}
                                        onChange={e => setFormData(f => ({ ...f, tags: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tiempo de lectura</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 5 min (opcional, se calcula)"
                                        value={formData.readTime}
                                        onChange={e => setFormData(f => ({ ...f, readTime: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group full">
                                    <label>Autor</label>
                                    <input
                                        type="text"
                                        placeholder="Nombre del autor"
                                        value={formData.author}
                                        onChange={e => setFormData(f => ({ ...f, author: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setModalOpen(false)}>
                                Cancelar
                            </button>
                            <button className="btn-save-draft" onClick={() => { setFormData(f => ({ ...f, status: 'draft' })); handleSave(false); }}>
                                <Save size={16} /> Guardar borrador
                            </button>
                            <button className="btn-publish-now" onClick={() => handleSave(true)}>
                                <Send size={16} /> Publicar ahora
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminar */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-panel confirm-panel" onClick={e => e.stopPropagation()}>
                        <div className="confirm-icon">
                            <AlertTriangle size={40} />
                        </div>
                        <h3>¿Eliminar artículo?</h3>
                        <p>Esta acción no se puede deshacer. El artículo se eliminará permanentemente.</p>
                        <div className="confirm-actions">
                            <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
                            <button className="btn-delete-confirm" onClick={() => handleDelete(deleteConfirm)}>
                                <Trash2 size={16} /> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
