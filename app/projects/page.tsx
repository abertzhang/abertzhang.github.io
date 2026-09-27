import { siteConfig } from '@/lib/site.config';

export const metadata = {
  title: 'Projects',
  description: 'Selected engineering projects — Flutter apps and Go services.',
};

const projects = [
  {
    name: 'Cross-Platform Mobile App',
    tech: 'Flutter · Dart · Riverpod',
    desc: 'A production mobile app (iOS & Android) with offline-first sync, clean architecture, and a snappy 120fps UI. Shipped to both stores with a 4.8★ rating.',
    href: 'https://github.com/your-username',
  },
  {
    name: 'High-Throughput API Service',
    tech: 'Go · gRPC · PostgreSQL',
    desc: 'A backend service handling millions of daily requests with sub-10ms p99 latency, structured logging, and zero-downtime deployments.',
    href: 'https://github.com/your-username',
  },
  {
    name: 'Realtime Dashboard',
    tech: 'Flutter Web · Go WebSocket',
    desc: 'A live operations dashboard streaming metrics over WebSocket with backpressure handling and a responsive, themeable UI.',
    href: 'https://github.com/your-username',
  },
  {
    name: 'Developer CLI',
    tech: 'Go · Cobra',
    desc: 'An internal CLI that cut onboarding time in half by automating environment setup, code generation, and CI checks.',
    href: 'https://github.com/your-username',
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
