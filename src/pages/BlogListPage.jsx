import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react'
import api from '../hooks/useApi'
import useDocumentTitle from '../hooks/useDocumentTitle'
import Breadcrumb from '../components/Breadcrumb'
import { PageSkeleton } from '../components/Skeleton'

export default function BlogListPage() {
  useDocumentTitle('Blog & Recipes')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/blog').then(r => setPosts(r.data.items || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSkeleton />

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <Breadcrumb items={[{ label: 'Blog & Recipes' }]} />

        <div className="text-center mb-10">
          <BookOpen size={32} className="text-gold mx-auto mb-3" />
          <h1 className="font-heading text-3xl md:text-4xl text-choco mb-2">Blog & Recipes</h1>
          <p className="text-choco/50 text-sm max-w-lg mx-auto">Discover new ways to enjoy Shahi Scoops — from decadent desserts to refreshing summer treats.</p>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gold/10">
            <BookOpen size={40} className="text-choco/20 mx-auto mb-3" />
            <p className="text-choco/40 text-sm">Coming soon! We're whipping up some delicious content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/blog/${post.slug}`} className="no-underline group">
                  <div className="bg-white rounded-2xl border border-gold/10 overflow-hidden hover:shadow-lg transition-all duration-300">
                    {post.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img src={post.image_url} alt={post.title} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-choco/40 mb-2">
                        {post.category && <span className="bg-gold/10 text-gold px-2.5 py-0.5 rounded-full font-medium">{post.category}</span>}
                        {post.created_at && <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(post.created_at).toLocaleDateString('en-IN')}</span>}
                      </div>
                      <h2 className="font-heading text-lg font-bold text-choco group-hover:text-gold transition-colors mb-2">{post.title}</h2>
                      {post.excerpt && <p className="text-sm text-choco/60 line-clamp-2">{post.excerpt}</p>}
                      <div className="flex items-center gap-1.5 text-sm text-gold mt-3 group-hover:gap-2.5 transition-all">
                        Read More <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
