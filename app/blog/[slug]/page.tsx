import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPostMeta, getPostBySlug } from '@/lib/posts';
import { formatDate } from '@/lib/format';
import CategoryBadge from '@/components/CategoryBadge';
import PostContent from '@/components/PostContent';

/** 静态导出：列出所有文章 slug 以便预渲染 */
export function generateStaticParams() {
  return getAllPostMeta().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article>
      <div className="post-header">
        <div className="container">
          <CategoryBadge slug={post.category} />
          <h1 className="title">{post.title}</h1>
          <div className="meta">
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.tags.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="post-body">
        <div className="container">
          <PostContent markdown={post.content} />

          <div style={{ marginTop: 48 }}>
            <Link href="/blog" className="btn btn-ghost">
              ← Back to all articles
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
