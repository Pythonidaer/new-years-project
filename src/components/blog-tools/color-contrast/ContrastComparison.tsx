import { useId, useState } from "react";
import type { ChangeEvent } from "react";
import { comparisonAnnouncement } from "./messages";
import { generateComparisonPair, type ContrastMode, type ContrastPair } from "./pairs";
import {
  ContrastPreview,
  ContrastReadout,
  GenerateButton,
  LiveStatus,
  ToolFrame,
} from "./ContrastParts";
import styles from "./ColorContrast.module.css";

function readMode(value: string): ContrastMode | null {
  if (value === "low") return "low";
  if (value === "high") return "high";
  return null;
}

function boundariesFor(mode: ContrastMode): number[] {
  if (mode === "high") return [7];
  return [3];
}

export function ContrastComparison() {
  const modeName = useId();
  const [mode, setMode] = useState<ContrastMode>("low");
  const [pair, setPair] = useState<ContrastPair>(() => generateComparisonPair("low"));
  const [announcement, setAnnouncement] = useState("");

  function publish(nextMode: ContrastMode, nextPair: ContrastPair) {
    setMode(nextMode);
    setPair(nextPair);
    setAnnouncement(comparisonAnnouncement(nextMode, nextPair));
  }

  function handleModeChange(event: ChangeEvent<HTMLInputElement>) {
    const nextMode = readMode(event.target.value);
    if (!nextMode || nextMode === mode) return;
    publish(nextMode, generateComparisonPair(nextMode));
  }

  function handleGenerate() {
    publish(mode, generateComparisonPair(mode));
  }

  return (
    <ToolFrame title="Contrast comparison">
      <p className={styles.note}>
        Choose low contrast (below 3:1) or high contrast (7:1 or higher), then generate an example.
        The colors apply only to the sample.
      </p>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Contrast mode</legend>
        <div className={styles.choices}>
          <label className={styles.choice}>
            <input
              type="radio"
              name={modeName}
              value="low"
              checked={mode === "low"}
              onChange={handleModeChange}
            />
            Low contrast
          </label>
          <label className={styles.choice}>
            <input
              type="radio"
              name={modeName}
              value="high"
              checked={mode === "high"}
              onChange={handleModeChange}
            />
            High contrast
          </label>
        </div>
      </fieldset>
      <GenerateButton label="Generate example" onGenerate={handleGenerate} />
      <ContrastPreview foreground={pair.foreground} background={pair.background} />
      <ContrastReadout
        foreground={pair.foreground}
        background={pair.background}
        ratio={pair.ratio}
        boundaries={boundariesFor(mode)}
      />
      <LiveStatus message={announcement} />
    </ToolFrame>
  );
}
