import { siteConfig } from '@/lib/site.config';

/**
 * 分类标签 —— 根据分类 slug 取颜色与名称，渲染一个小徽章。
 */
export default function CategoryBadge({ slug }: { slug: string }) {
  const cat = siteConfig.categories.find((c) => c.slug === slug);
  if (!cat) return null;
  return (
    <span className="badge" style={{ ['--c' as string]: cat.color }}>
      <span className="dot" />
      {cat.name}
    </span>
  );
}
