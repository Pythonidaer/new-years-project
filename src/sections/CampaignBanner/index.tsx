import { Container } from "@/layout/Container";
import { Section } from "@/layout/Section";
import { useTheme } from "@/context/useTheme";
import { getGrayscaleFilter } from "@/utils/imageGrayscale";
import styles from "./CampaignBanner.module.css";
import buttonStyles from "@/components/Button.module.css";

export function CampaignBanner() {
  const { currentPresetId } = useTheme();
  const isNoirTheme = currentPresetId === 'noir';

  return (
    <Section className={styles.banner} id="contact">
      <Container className={styles.contactContainer}>
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <h2 className={styles.heading}>
              Let's{" "}
              <span className={styles.accent}>Connect</span>
            </h2>
            <p className={styles.text}>
              Interested in working together? Reach out via{" "}
              <a href="mailto:JHJonathanHammond@gmail.com" className={styles.link}>
                email
              </a>
              {" "}or connect on{" "}
              <a 
                href="https://www.linkedin.com/in/jonamichahammo" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.link}
              >
                LinkedIn
              </a>
              {" "}to discuss opportunities.
            </p>
            <div className={styles.cta}>
              <a 
                href="/JonathanHammondResume.pdf" 
                download="Jonathan-Hammond-Resume.pdf"
                className={buttonStyles.primary}
              >
                Download Resume
              </a>
            </div>
          </div>
          <div className={styles.image}>
            <img 
              src="/Jonathan_Hammond.webp" 
              alt="Jonathan Hammond"
              className={styles.imageContent}
              style={{ filter: getGrayscaleFilter(isNoirTheme) }}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

