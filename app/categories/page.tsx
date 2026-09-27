import Link from 'next/link';
import { getCategoryCounts } from '@/lib/posts';

export const metadata = {
  title: 'Categories',
  description: 'Browse articles by technical topic.',
};

export default function CategoriesPage() {
  const categories = getCategoryCounts();

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2>Categories</h2>
          <span>{categories.length} topics</span>
        </div>
        <div className="cat-grid">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="cat-card"
              style={{ textDecoration: 'none' }}
            >
              <div className="swatch" style={{ background: c.color }} />
              <h3 style={{ color: 'var(--fg)' }}>{c.name}</h3>
              <p>{c.description}</p>
              <span className="count">{c.count} articles</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
