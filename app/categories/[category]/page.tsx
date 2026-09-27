import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCategoryCounts,
  getPostsByCategory,
} from '@/lib/posts';
import { siteConfig } from '@/lib/site.config';
import PostCard from '@/components/PostCard';

export function generateStaticParams() {
  return getCategoryCounts().map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const cat = siteConfig.categories.find((c) => c.slug === params.category);
  if (!cat) return { title: 'Not found' };
  return { title: cat.name, description: cat.description };
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const cat = siteConfig.categories.find((c) => c.slug === params.category);
  if (!cat) notFound();

  const posts = getPostsByCategory(params.category);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2>
            <span
              className="badge"
              style={{ ['--c' as string]: cat.color, marginRight: 10 }}
            >
              <span className="dot" />
              {cat.name}
            </span>
          </h2>
          <Link href="/categories">All categories →</Link>
        </div>
        <p className="lead" style={{ marginBottom: 28 }}>
          {cat.description}
        </p>
        <div className="grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
