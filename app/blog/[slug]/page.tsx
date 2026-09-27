import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPostMeta, getPostBySlug } from '@/lib/posts';
import { formatDate } from '@/lib/format';
import { siteConfig } from '@/lib/site.config';
import CategoryBadge from '@/components/CategoryBadge';
import PostContent from '@/components/PostContent';
import TableOfContents from '@/components/TableOfContents';
import { extractToc } from '@/lib/toc';

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

  // 构建期提取目录（h1~h3），供右侧 TOC 使用；空数组时 TOC 组件自动不渲染
  const toc = extractToc(post.content);

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
          {/* 两栏布局：左为正文，右为粘性目录；窄屏自动收起（见 globals.css） */}
          <div className="post-layout">
            <div className="post-main">
              <PostContent markdown={post.content} />

              <div style={{ marginTop: 48 }}>
                <Link href="/blog" className="btn btn-ghost">
                  ← Back to all articles
                </Link>
              </div>

              {/* 仅当文章 frontmatter 设置 copyright: true 时显示版权声明 */}
              {post.copyright && (
                <p
                  className="copyright-note"
                  style={{ marginTop: 24, color: '#6b7280', fontSize: 14 }}
                >
                  © {post.date.slice(0, 4)} {siteConfig.name}. All rights reserved.
                </p>
              )}
            </div>

            {/* 右侧目录：仅在文章有标题时渲染（组件内部已做空判断） */}
            <aside className="post-toc">
              <TableOfContents items={toc} />
            </aside>
          </div>
        </div>
      </div>
    </article>
  );
}
