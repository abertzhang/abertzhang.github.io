import { siteConfig } from '@/lib/site.config';

export const metadata = {
  title: 'Contact',
  description: `Get in touch with ${siteConfig.name}.`,
};

export default function ContactPage() {
  return (
    <section className="section">
      <div className="container prose-page">
        <h1>Get in Touch</h1>
        <p className="lead">
          I&apos;m currently open to new opportunities and collaborations. The
          fastest way to reach me is email, but I&apos;m also active on the
          platforms below.
        </p>

        <h2>Direct</h2>
        <ul>
          {siteConfig.social.map((s) => (
            <li key={s.href}>
              <strong>{s.label}:</strong>{' '}
              <a href={s.href} target="_blank" rel="noopener noreferrer">
                {s.href.replace(/^mailto:/, '')}
              </a>
            </li>
          ))}
        </ul>

        <h2>Let&apos;s talk</h2>
        <p>
          Whether it&apos;s a Flutter mobile role, a Go backend position, or a
          general engineering chat — I&apos;d love to hear from you.
        </p>
      </div>
    </section>
  );
}
