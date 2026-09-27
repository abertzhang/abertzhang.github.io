import Link from 'next/link';
import {
  getAllPostMeta,
  getCategoryCounts,
} from '@/lib/posts';
import { siteConfig } from '@/lib/site.config';
import PostCard from '@/components/PostCard';

export default function HomePage() {
  const posts = getAllPostMeta().slice(0, 4);
  const categories = getCategoryCounts();
  const totalPosts = getAllPostMeta().length;

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <p className="eyebrow">Engineering Portfolio &amp; Blog</p>
          <h1>{siteConfig.name}</h1>
          <p className="tagline">
            {siteConfig.role}. {siteConfig.tagline}
          </p>
          <div className="actions">
            <Link href="/blog" className="btn btn-primary">
              Read the blog
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Get in touch
            </Link>
          </div>
          <div className="meta">
            <div className="stat">
              <strong>{totalPosts}</strong>
              Articles published
            </div>
            <div className="stat">
              <strong>{categories.length}</strong>
              Technical topics
            </div>
            <div className="stat">
              <strong>Open</strong>
              To new opportunities
            </div>
          </div>
        </div>
      </section>

      {/* Latest writing */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Latest Writing</h2>
            <Link href="/blog">View all →</Link>
          </div>
          <div className="grid">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>Browse by Topic</h2>
            <Link href="/categories">All categories →</Link>
          </div>
          <div className="cat-grid">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="cat-card"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="swatch"
                  style={{ background: c.color }}
                />
                <h3 style={{ color: 'var(--fg)' }}>{c.name}</h3>
                <p>{c.description}</p>
                <span className="count">{c.count} articles</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
