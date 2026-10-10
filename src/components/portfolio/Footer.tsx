import { profile } from "@/data/portfolio";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="shell">
        <div className="footer-top">
          <div>
            <p className="eyebrow">Start a conversation</p>
            <h2>
              Let’s build something
              <br />
              <em>worth understanding.</em>
            </h2>
          </div>
          <a className="contact-link" href={`mailto:${profile.email}`}>
            {profile.email} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="footer-bottom">
          <span>
            {profile.name}{" "}
            <span className="footer-role">
              / AI Systems & Full Stack Engineer
            </span>
          </span>
          <nav aria-label="Professional links">
            <a href={profile.github}>GitHub ↗</a>
            <a href={profile.linkedin}>LinkedIn ↗</a>
            <a href="/docs/Lalu_FullStack-AI-Resume.pdf">Résumé ↗</a>
            <Link href="/about">About</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
