import Link from 'next/link';
import { siteConfig } from '@/lib/site.config';

/** 页脚 —— 展示版权、导航与社交链接。 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div>
          © {year} {siteConfig.name}. Built with Next.js · Deployed on GitHub
          Pages.
        </div>
        <div className="links">
          {siteConfig.social.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
