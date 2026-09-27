import { siteConfig } from '@/lib/site.config';

export const metadata = {
  title: 'Projects',
  description: 'Selected engineering projects — mobile apps, backend services, and data systems.',
};

const projects = [
  {
    name: 'Personal Blog & Portfolio',
    tech: 'Next.js · React · TypeScript · Go (Gin)',
    desc: 'A statically-exported personal blog and portfolio built with Next.js, featuring Markdown articles, a right-side table of contents, and a Go (Gin) + SQLite backend with JWT auth. Deployed to GitHub Pages via CI.',
    href: 'https://github.com/abertzhang/abertzhang.github.io',
  },
  {
    name: 'Knot Tying Recognition App',
    tech: 'Flutter · Dart · TensorFlow Lite · Isar · Supabase',
    desc: 'A cross-platform Flutter app that recognizes knot types from camera input through a two-stage on-device TFLite pipeline (YOLOX localizer + MobileNetV3 classifier), with local Isar persistence and Supabase auth.',
    href: 'https://github.com/abertzhang',
  },
  {
    name: 'QuantChip Stock Selection System',
    tech: 'Python · pandas · Node.js · React',
    desc: 'A quantitative stock-selection system combining multi-factor strategies, regime-switching, and backtesting, served by a Node backend with a React dashboard.',
    href: 'https://github.com/abertzhang',
  },
  {
    name: 'Knot-Coach Animation Pipeline',
    tech: 'Blender · Python · Geometry Nodes',
    desc: 'A Blender pipeline that generates knot-tying teaching animations from real Knotus paths, rendering growth animation via Geometry Nodes and exporting MP4 + GLB.',
    href: 'https://github.com/abertzhang',
  },
];

export default function ProjectsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2>Selected Projects</h2>
          <a href={siteConfig.social[0]?.href} target="_blank" rel="noopener noreferrer">
            More on GitHub →
          </a>
        </div>
        <div className="project-list">
          {projects.map((p) => (
            <div className="project" key={p.name}>
              <h3>{p.name}</h3>
              <div className="tech">{p.tech}</div>
              <p>{p.desc}</p>
              <a href={p.href} target="_blank" rel="noopener noreferrer">
                View →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
