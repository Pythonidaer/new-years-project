import { Container } from "../../layout/Container";
import { Facebook, Twitter, Linkedin, Github } from "lucide-react";
import { slugify } from "../../utils/slug";
import styles from "./Footer.module.css";

const aboutMeLinks = [
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Resources", href: "/resources/blog" },
  { label: "Contact", href: "/#contact" },
];

const hobbies = [
  { label: "Comedy", url: "https://en.wikipedia.org/wiki/Comedy" },
  { label: "Boxing", url: "https://en.wikipedia.org/wiki/Boxing" },
  { label: "Coding", url: "https://en.wikipedia.org/wiki/Computer_programming" },
  { label: "Movies", url: "https://en.wikipedia.org/wiki/Film" },
];

const desiredRoles = [
  { label: "Frontend Engineer", url: "https://en.wikipedia.org/wiki/Front-end_web_development" },
  { label: "Software Engineer", url: "https://en.wikipedia.org/wiki/Software_engineering" },
  { label: "Data Analyst", url: "https://en.wikipedia.org/wiki/Data_analysis" },
  { label: "AI Engineer", url: "https://en.wikipedia.org/wiki/Artificial_intelligence" },
];

const blogCategories = [
  { label: "Architecture", category: "Frontend Architecture" },
  { label: "Maintainability", category: "Maintainability" },
  { label: "Caching", category: "Caching" },
  { label: "Interview Prep", category: "Interview Prep" },
];

const socialLinks = [
  { icon: Facebook, href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", label: "Facebook" },
  { icon: Twitter, href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", label: "Twitter" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/jonamichahammo", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/pythonidaer", label: "Github" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.footerContainer}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.brandName}>Find Me Easily</div>
            <p className={styles.brandText}>
              I am frequently checking my LinkedIn and email. Feel free to visit my profile or code repositories below.
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
                    target="_blank"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
          <div className={styles.links}>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkHeading}>About Me</h3>
              <ul className={styles.linkList}>
                {aboutMeLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkHeading}>Blogs</h3>
              <ul className={styles.linkList}>
                {blogCategories.map((item) => (
                  <li key={item.label}>
                    <a href={`/resources/tag/${slugify(item.category)}`} className={styles.link}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkHeading}>Hobbies</h3>
              <ul className={styles.linkList}>
                {hobbies.map((hobby) => (
                  <li key={hobby.label}>
                    <a href={hobby.url} className={styles.link} target="_blank" rel="noopener noreferrer">
                      {hobby.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.linkColumn}>
              <h3 className={styles.linkHeading}>Desired Roles</h3>
              <ul className={styles.linkList}>
                {desiredRoles.map((role) => (
                  <li key={role.label}>
                    <a href={role.url} className={styles.link} target="_blank" rel="noopener noreferrer">
                      {role.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            Copyright {new Date().getFullYear()}
          </p>
          <div className={styles.legal}>
            <a href="#" className={styles.legalLink}>
              Jonnovative Designs
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

