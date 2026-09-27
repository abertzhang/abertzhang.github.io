/**
 * 文章加载层 —— 在构建期（SSG）读取 content/ 下的 Markdown 文件，
 * 解析 frontmatter 元数据，供页面与静态导出使用。
 *
 * 依赖 Node 文件系统（仅在构建/服务端运行，静态导出不会把此逻辑打包到前端）。
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
  /** 分类 slug，对应 site.config.ts 中的 categories */
  category: string;
  tags: string[];
  excerpt: string;
  /** 可选封面图路径（放在 /public 下，或外链） */
  cover?: string;
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
  const { data, content } = matter(raw);

  return {
    slug: slugFromFilename(filename),
    title: data.title || slugFromFilename(filename),
    date: data.date ? String(data.date).slice(0, 10) : '1970-01-01',
    category: data.category || 'other',
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    excerpt: data.excerpt || '',
    cover: data.cover,
    content,
  };
}

/** 获取全部文章（按日期倒序） */
export function getAllPosts(): Post[] {
  return readMarkdownFiles()
    .map(parsePost)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
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
