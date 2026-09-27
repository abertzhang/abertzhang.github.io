/**
 * 站点全局配置 —— 上线前请在此处替换为你自己的信息。
 * 这是整个博客唯一需要手动编辑的「个人信息」文件。
 */

export interface SocialLink {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Category {
  /** URL 用的短标识，必须小写、无空格，例如 "flutter" */
  slug: string;
  /** 展示名 */
  name: string;
  /** 分类一句话描述 */
  description: string;
  /** 主题色（CSS 颜色值），用于标签/卡片点缀 */
  color: string;
}

export const siteConfig = {
  /** 站点标题（浏览器标签、SEO） */
  title: 'Jordan Lee — Engineering Blog',
  /** 首页主标题（Hero） */
  name: 'Jordan Lee',
  /** 一句话定位，面向招聘方 */
  role: 'Senior Software Engineer · Flutter & Go',
  /** 首页副标题 / 简介 */
  tagline:
    'I build cross-platform mobile apps with Flutter and scalable backend services with Go. This is where I write about engineering, architecture, and the things I ship.',
  /** 站点描述（SEO / 分享卡片） */
  description:
    'Engineering blog and portfolio of Jordan Lee — Flutter, Golang, and general software craft, written for fellow engineers and hiring teams.',
  /** 站点根 URL（用于 SEO / canonical，部署后填真实地址，如 https://user.github.io/repo） */
  siteUrl: 'https://example.github.io',
  /** 文章存放目录（相对项目根） */
  contentDir: 'content',
  /** 顶部导航 */
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Categories', href: '/categories' },
    { label: 'Projects', href: '/projects' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ] as NavItem[],
  /** 联系方式 / 社交链接（页脚 + 联系页） */
  social: [
    { label: 'GitHub', href: 'https://github.com/your-username' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-handle' },
    { label: 'Email', href: 'mailto:you@example.com' },
  ] as SocialLink[],
  /** 技术分类。新增分类时在此追加，并在 content/ 里用同样的 slug 标记文章。 */
  categories: [
    {
      slug: 'flutter',
      name: 'Flutter',
      description: 'Cross-platform mobile, desktop & web apps with Dart and Flutter.',
      color: '#02569B',
    },
    {
      slug: 'golang',
      name: 'Golang',
      description: 'Backend services, APIs, and CLI tools built with Go.',
      color: '#00ADD8',
    },
    {
      slug: 'other',
      name: 'Other',
      description: 'General software engineering, career, and tooling notes.',
      color: '#6B7280',
    },
  ] as Category[],
};

export type SiteConfig = typeof siteConfig;
