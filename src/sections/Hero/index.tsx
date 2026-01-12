import { Button } from "../../components/Button";
import { Container } from "../../layout/Container";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <Container>
        <h1 className={styles.title}>
          Lorem{" "}
          <span className={styles.accent}>dolce decorum</span>{" "}
          ipsum
          <br />
          dolor sit amet consectetur
        </h1>
        <p className={styles.subtitle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div className={styles.cta}>
          <Button>Lorem Ipsum</Button>
        </div>
      </Container>
    </section>
  );
}

