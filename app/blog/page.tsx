import { getAllPostMeta } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export const metadata = {
  title: 'Blog',
  description: 'All engineering articles — Flutter, Golang, and more.',
};

export default function BlogPage() {
  const posts = getAllPostMeta();

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2>All Articles</h2>
          <span>{posts.length} posts</span>
        </div>
        {posts.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>
            No articles yet. Add a Markdown file to the <code>content/</code>{' '}
            folder to publish your first post.
          </p>
        ) : (
          <div className="grid">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
