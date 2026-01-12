import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { Button } from "../../components/Button";
import styles from "./CampaignBanner.module.css";

export function CampaignBanner() {
  return (
    <Section className={styles.banner}>
      <Container>
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <h2 className={styles.heading}>
              Lorem{" "}
              <span className={styles.accent}>Ipsum</span>
            </h2>
            <p className={styles.text}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className={styles.cta}>
              <Button>Lorem Ipsum</Button>
            </div>
          </div>
          <div className={styles.image}>
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderText}>Lorem Ipsum</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

