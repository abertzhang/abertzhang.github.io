import { siteConfig } from '@/lib/site.config';

export const metadata = {
  title: 'About',
  description: `About ${siteConfig.name} — ${siteConfig.role}.`,
};

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container prose-page">
        <h1>About Me</h1>
        <p className="lead">
          Hi, I&apos;m {siteConfig.name}, a {siteConfig.role.toLowerCase()}. I
          care about shipping reliable software and clean, maintainable code —
          from pixel-perfect mobile UI to high-throughput backend services.
        </p>

        <h2>What I do</h2>
        <ul>
          <li>
            <strong>Mobile &amp; cross-platform:</strong> Building production
            Flutter apps for iOS, Android, web, and desktop with a strong focus
            on performance and UX.
          </li>
          <li>
            <strong>Backend &amp; APIs:</strong> Designing scalable services and
            REST/gRPC APIs in Go, with an eye for concurrency, observability, and
            clean architecture.
          </li>
          <li>
            <strong>Developer experience:</strong> CI/CD, testing, and tooling
            that keep teams fast and confident.
          </li>
        </ul>

        <h2>How I work</h2>
        <p>
          I prefer small, reversible changes; clear interfaces; and measuring
          before optimizing. I write to understand, and I document what future
          me will wish I had written down.
        </p>

        <h2>Currently</h2>
        <p>
          Open to new engineering roles and collaborations. If you&apos;re
          hiring for Flutter or Go work — or just want to talk shop — reach out
          via the <a href="/contact">contact page</a>.
        </p>
      </div>
    </section>
  );
}
