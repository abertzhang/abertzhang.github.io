/**
 * 文章加载层 —— 在构建期（SSG）读取 content/ 下的 Markdown 文件，
 * 解析 frontmatter 元数据，供页面与静态导出使用。
 *
 * 依赖 Node 文件系统（仅在构建/服务端运行，静态导出不会把此逻辑打包到前端）。
 *
 * 支持的 frontmatter 字段（完整示例见 doc/article-template.md）：
 *   title     文章标题
 *   date      发布日期 YYYY-MM-DD
 *   category  分类 slug（Flutter / Golang / Other，大小写不敏感，内部统一转小写）
 *   tags      标签列表
 *   summary   一句话摘要（兼容旧字段 excerpt）
 *   top       置顶权重，数字越大越靠前（默认 0）
 *   copyright true 时在文章底部显示版权声明（默认 false）
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { siteConfig } from './site.config';

/** 文章元数据（不含正文） */
export interface PostMeta {
  /** URL 标识，取自文件名（去掉日期前缀与扩展名） */
  slug: string;
  title: string;
  /** ISO 日期字符串，如 2026-01-15 */
  date: string;
  /** 分类 slug，对应 site.config.ts 中的 categories（已统一为小写） */
  category: string;
  tags: string[];
  /** 一句话摘要（来自 frontmatter 的 summary，兼容旧字段 excerpt） */
  excerpt: string;
  /** 可选封面图路径（放在 /public 下，或外链） */
  cover?: string;
  /** 置顶权重，数字越大越靠前（默认 0） */
  top?: number;
  /** 是否显示版权声明（默认 false） */
  copyright?: boolean;
}

/** 单篇文章（含正文原始 Markdown） */
export interface Post extends PostMeta {
  /** 文章正文（不含 frontmatter 的 Markdown 源） */
  content: string;
}

/** 分类聚合（含该分类下的文章数） */
export interface CategoryCount {
  slug: string;
  name: string;
  description: string;
  color: string;
  count: number;
}

/** 从文件名提取 slug：去掉 `YYYY-MM-DD-` 前缀与 `.md` 后缀 */
function slugFromFilename(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/** 将 frontmatter 里的 date 统一规整为 YYYY-MM-DD 字符串（兼容 Date 对象或字符串） */
function normalizeDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === 'string') return d.slice(0, 10);
  return '1970-01-01';
}

/**
 * 兼容「冒号后无空格」的 frontmatter 写法（如 `title:文章标题`、`tags:[a,b]`）。
 * gray-matter 底层的 js-yaml 要求 key 后必须有空格，否则整段会被当成单个字符串。
 * 此函数仅在首个 `---` 代码块内，把 `key:value` 规整为 `key: value`，正文不受影响。
 */
function normalizeFrontmatter(raw: string): string {
  const fence = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fence) return raw;
  const fm = fence[1].replace(
    /^(\s*[A-Za-z_\u4e00-\u9fff][\w\u4e00-\u9fff-]*):(\S)/gm,
    '$1: $2',
  );
  return raw.replace(fence[1], fm);
}

/** 读取 content 目录下的全部 .md 文件 */
function readMarkdownFiles(): string[] {
  const dir = path.join(process.cwd(), siteConfig.contentDir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'));
}

/** 解析单篇文件的 frontmatter 与正文 */
function parsePost(filename: string): Post {
  const fullPath = path.join(process.cwd(), siteConfig.contentDir, filename);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  // 先规整「无空格冒号」写法（如 title:文章标题），确保 gray-matter 能正确解析 frontmatter
  const { data, content } = matter(normalizeFrontmatter(raw));

  return {
    slug: slugFromFilename(filename),
    title: data.title || slugFromFilename(filename),
    // 日期优先取 create（新格式），回退兼容旧字段 date / update
    date: normalizeDate(data.create ?? data.date ?? data.update),
    // 分类大小写不敏感：统一转小写以匹配 site.config.ts 的 slug（如 Flutter → flutter）
    category: String(data.category || 'other').toLowerCase(),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    // 摘要优先取 summary，兼容旧字段 excerpt
    excerpt: typeof data.summary === 'string' ? data.summary : (data.excerpt || ''),
    cover: data.cover,
    // 置顶权重：数字越大越靠前，缺省为 0
    top: typeof data.top === 'number' ? data.top : 0,
    // 版权声明：仅当显式 true 时开启
    copyright: data.copyright === true,
    content,
  };
}

/** 获取全部文章（先按置顶权重，再按日期倒序） */
export function getAllPosts(): Post[] {
  return readMarkdownFiles()
    .map(parsePost)
    .sort((a, b) => {
      // 置顶权重高的排在前面
      if ((b.top ?? 0) !== (a.top ?? 0)) return (b.top ?? 0) - (a.top ?? 0);
      // 同权重时按日期倒序
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });
}

/** 仅返回元数据（列表页用，避免带入正文） */
export function getAllPostMeta(): PostMeta[] {
  return getAllPosts().map(({ content, ...meta }) => meta);
}

/** 按 slug 取单篇文章（含正文） */
export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) || null;
}

/** 按分类 slug 过滤文章 */
export function getPostsByCategory(categorySlug: string): PostMeta[] {
  return getAllPostMeta().filter((p) => p.category === categorySlug);
}

/** 返回所有在用的分类及其文章数量（仅包含确实有文章的分类） */
export function getCategoryCounts(): CategoryCount[] {
  const posts = getAllPostMeta();
  return siteConfig.categories
    .map((c) => ({
      ...c,
      count: posts.filter((p) => p.category === c.slug).length,
    }))
    .filter((c) => c.count > 0);
}

/** 根据 slug 取分类信息（含名称/颜色） */
export function getCategory(slug: string) {
  return siteConfig.categories.find((c) => c.slug === slug);
}
