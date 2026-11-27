import { useState } from "react";
import { highContrastAnnouncement } from "./messages";
import { generateHighContrastPair, type ContrastPair } from "./pairs";
import {
  ContrastPreview,
  ContrastReadout,
  GenerateButton,
  LiveStatus,
  ToolFrame,
} from "./ContrastParts";
import styles from "./ColorContrast.module.css";

export function ContrastGenerator() {
  const [pair, setPair] = useState<ContrastPair>(() => generateHighContrastPair());
  const [announcement, setAnnouncement] = useState("");

  function handleGenerate() {
    const nextPair = generateHighContrastPair();
    setPair(nextPair);
    setAnnouncement(highContrastAnnouncement(nextPair));
  }

  return (
    <ToolFrame title="High-contrast pair generator">
      <p className={styles.note}>
        Generate a random foreground and background. Each pair is at least 7:1.
        Nothing outside this sample changes.
      </p>
      <GenerateButton label="Generate pair" onGenerate={handleGenerate} />
      <ContrastPreview foreground={pair.foreground} background={pair.background} />
      <ContrastReadout
        foreground={pair.foreground}
        background={pair.background}
        ratio={pair.ratio}
        boundaries={[7]}
      />
      <LiveStatus message={announcement} />
    </ToolFrame>
  );
}
