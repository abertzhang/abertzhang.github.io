'use client';

/**
 * 文章正文渲染组件（客户端）。
 * 使用 react-markdown 渲染 Markdown，并叠加：
 *  - remark-gfm        ：表格 / 任务列表 / 删除线等 GitHub 风格语法
 *  - rehype-slug       ：为标题生成 id（用于锚点）
 *  - rehype-autolink-headings：标题可点击锚点
 *  - rehype-highlight  ：代码块语法高亮（highlight.js）
 * 高亮主题样式由下方 CSS 引入。
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

export default function PostContent({ markdown }: { markdown: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
          rehypeHighlight,
        ]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
