import Link from 'next/link';
import { PostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/format';
import CategoryBadge from './CategoryBadge';

/** 文章卡片 —— 用于首页与博客列表。 */
export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="card">
      <CategoryBadge slug={post.category} />
      <h3>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="excerpt">{post.excerpt}</p>
      <div className="foot">
        <span>{formatDate(post.date)}</span>
        <span>{post.tags.slice(0, 2).join(' · ')}</span>
      </div>
    </article>
  );
}
