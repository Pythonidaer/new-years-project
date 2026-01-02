import { Container } from "../../layout/Container";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import styles from "./Footer.module.css";

const footerLinks = {
  platform: [
    { label: "Lorem Ipsum", href: "#" },
    { label: "Dolor Sit", href: "#" },
    { label: "Amet Consectetur", href: "#" },
    { label: "Adipiscing Elit", href: "#" },
  ],
  solutions: [
    { label: "Sed Do Eiusmod", href: "#" },
    { label: "Tempor Incididunt", href: "#" },
    { label: "Ut Labore", href: "#" },
    { label: "Dolore Magna", href: "#" },
  ],
  resources: [
    { label: "Aliqua Ut Enim", href: "#" },
    { label: "Minim Veniam", href: "#" },
    { label: "Quis Nostrud", href: "#" },
    { label: "Exercitation", href: "#" },
  ],
  company: [
    { label: "Ullamco Laboris", href: "#" },
    { label: "Nisi Ut Aliquip", href: "#" },
    { label: "Ex Ea Commodo", href: "#" },
    { label: "Consequat Duis", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.brandName}>Lorem Ipsum</div>
            <p className={styles.brandText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
            </p>
            <div className={styles.social}>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className={styles.socialLink}
                    aria-label={social.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
          <div className={styles.links}>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkHeading}>Lorem Ipsum</h3>
              <ul className={styles.linkList}>
                {footerLinks.platform.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkHeading}>Dolor Sit</h3>
              <ul className={styles.linkList}>
                {footerLinks.solutions.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkHeading}>Amet Consectetur</h3>
              <ul className={styles.linkList}>
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkHeading}>Adipiscing Elit</h3>
              <ul className={styles.linkList}>
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <div className={styles.legal}>
            <a href="#" className={styles.legalLink}>
              Sed Do Eiusmod
            </a>
            <a href="#" className={styles.legalLink}>
              Tempor Incididunt
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

