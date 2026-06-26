import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Tag, BookOpen } from 'lucide-react'
import api from '../hooks/useApi'
import useDocumentTitle from '../hooks/useDocumentTitle'
import Breadcrumb from '../components/Breadcrumb'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/blog/${slug}`).then(r => setPost(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  useDocumentTitle(post?.title)

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-16 flex flex-col items-center justify-center">
        <BookOpen size={48} className="text-choco/20 mb-4" />
        <p className="font-heading text-2xl text-choco mb-2">Post not found</p>
        <Link to="/blog" className="text-gold no-underline hover:underline text-sm">Back to Blog</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <Breadcrumb items={[{ label: 'Blog & Recipes', href: '/blog' }, { label: post.title }]} />

        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-choco/50 hover:text-gold no-underline mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {post.image_url && (
            <div className="rounded-2xl overflow-hidden mb-8">
              <img src={post.image_url} alt={post.title} className="w-full aspect-video object-cover" />
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-choco/40 mb-3 flex-wrap">
            {post.category && <span className="bg-gold/10 text-gold px-3 py-1 rounded-full font-medium">{post.category}</span>}
            {post.created_at && <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
            {post.author && <span className="flex items-center gap-1"><User size={11} /> {post.author}</span>}
          </div>

          <h1 className="font-heading text-3xl md:text-4xl text-choco mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-choco/60 mb-6 leading-relaxed">{post.excerpt}</p>}

          <div className="prose prose-sm max-w-none text-choco/70 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {post.tags && (
            <div className="flex items-center gap-2 mt-8 pt-6 border-t border-gold/10">
              <Tag size={14} className="text-choco/30" />
              {post.tags.split(',').map(tag => (
                <span key={tag} className="text-xs bg-cream border border-choco/10 rounded-full px-3 py-1 text-choco/50">{tag.trim()}</span>
              ))}
            </div>
          )}
        </motion.article>
      </div>
    </div>
  )
}
