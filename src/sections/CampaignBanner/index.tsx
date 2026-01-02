import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";
import { Button } from "../../components/Button";
import { useContent } from "../../content/ContentProvider";
import styles from "./CampaignBanner.module.css";

export function CampaignBanner() {
  const { t } = useContent();
  
  return (
    <Section className={styles.banner}>
      <Container>
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <h2 className={styles.heading}>
              {t("campaignBanner.heading")}{" "}
              <span className={styles.accent}>{t("campaignBanner.headingAccent")}</span>
            </h2>
            <p className={styles.text}>
              {t("campaignBanner.text")}
            </p>
            <div className={styles.cta}>
              <Button>{t("campaignBanner.ctaLabel")}</Button>
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

