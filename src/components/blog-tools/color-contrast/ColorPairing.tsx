import { useId, useState } from "react";
import type { ChangeEvent } from "react";
import { colorInputValue, hexValidationMessage, normalizeHexColor } from "./hexColor";
import { impossiblePairingMessage, pairingSuccessMessage } from "./messages";
import {
  generateMatchingPair,
  type ColorRole,
  type MatchingResult,
  type MatchingSuccess,
} from "./pairs";
import {
  ContrastPreview,
  ContrastReadout,
  GenerateButton,
  LiveStatus,
  ToolFrame,
} from "./ContrastParts";
import styles from "./ColorContrast.module.css";

type TargetChoice = "7" | "4.5";

const TARGET_RATIOS: Record<TargetChoice, number> = {
  "7": 7,
  "4.5": 4.5,
};

function readTarget(value: string): TargetChoice | null {
  if (value === "7") return "7";
  if (value === "4.5") return "4.5";
  return null;
}

function readRole(value: string): ColorRole | null {
  if (value === "foreground") return "foreground";
  if (value === "background") return "background";
  return null;
}

function failureMessage(result: MatchingResult): string {
  if (result.ok || result.reason === "invalid") {
    return "Enter a valid hex color before generating a match.";
  }
  return impossiblePairingMessage(result);
}

export function ColorPairing() {
  const hexId = useId();
  const pickerId = useId();
  const roleId = useId();
  const targetId = useId();
  const errorId = useId();
  const [hexInput, setHexInput] = useState("#112244");
  const [pickerColor, setPickerColor] = useState("#112244");
  const [role, setRole] = useState<ColorRole>("foreground");
  const [target, setTarget] = useState<TargetChoice>("7");
  const [inputError, setInputError] = useState<string | null>(null);
  const [resultNote, setResultNote] = useState<string | null>(null);
  const [pair, setPair] = useState<MatchingSuccess | null>(null);
  const [announcement, setAnnouncement] = useState("");

  function clearStalePair(message: string) {
    if (!pair) return;
    setPair(null);
    setAnnouncement(message);
  }

  function handleHexChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setHexInput(value);
    const normalized = normalizeHexColor(value);
    setInputError(hexValidationMessage(value));
    setResultNote(null);
    if (normalized) setPickerColor(normalized);
    clearStalePair("The previous pair was cleared. Generate again after the color is valid.");
  }

  function handlePickerChange(event: ChangeEvent<HTMLInputElement>) {
    const normalized = normalizeHexColor(event.target.value);
    if (!normalized) return;
    setPickerColor(normalized);
    setHexInput(normalized);
    setInputError(null);
    setResultNote(null);
    clearStalePair("The previous pair was cleared. Generate again for this color.");
  }

  function handleBlur() {
    const normalized = normalizeHexColor(hexInput);
    if (!normalized) return;
    setHexInput(normalized);
    setPickerColor(normalized);
  }

  function handleRoleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextRole = readRole(event.target.value);
    if (!nextRole) return;
    setRole(nextRole);
    clearStalePair("The previous pair was cleared. Generate again for this role.");
  }

  function handleTargetChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextTarget = readTarget(event.target.value);
    if (!nextTarget) return;
    setTarget(nextTarget);
    clearStalePair("The previous pair was cleared. Generate again for this target.");
  }

  function handleGenerate() {
    const validation = hexValidationMessage(hexInput);
    if (validation) {
      setInputError(validation);
      setResultNote(null);
      setAnnouncement(validation);
      setPair(null);
      return;
    }
    const normalized = normalizeHexColor(hexInput);
    if (!normalized) return;
    const minimumRatio = TARGET_RATIOS[target];
    const next = generateMatchingPair({
      baseColor: normalized,
      role,
      minimumRatio,
    });
    setHexInput(normalized);
    setPickerColor(normalized);
    setInputError(null);
    setPair(next.ok ? next : null);
    const message = next.ok ? pairingSuccessMessage(next, minimumRatio) : failureMessage(next);
    setResultNote(next.ok ? null : message);
    setAnnouncement(message);
  }

  const describedBy = inputError ? errorId : undefined;

  return (
    <ToolFrame title="Color pairing">
      <p className={styles.note}>
        Enter a base color and whether it is the foreground or the background.
        The default target is AAA normal text, 7:1. Generate keeps that base color.
      </p>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={hexId}>Hex color</label>
          <input
            id={hexId}
            className={styles.hexInput}
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            onBlur={handleBlur}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-invalid={inputError ? true : undefined}
            aria-describedby={describedBy}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={pickerId}>Color picker</label>
          <input
            id={pickerId}
            className={styles.colorInput}
            type="color"
            value={colorInputValue(pickerColor)}
            onChange={handlePickerChange}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={roleId}>Use this color as</label>
          <select id={roleId} className={styles.select} value={role} onChange={handleRoleChange}>
            <option value="foreground">Foreground</option>
            <option value="background">Background</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={targetId}>Contrast target</label>
          <select id={targetId} className={styles.select} value={target} onChange={handleTargetChange}>
            <option value="7">AAA normal text, 7:1</option>
            <option value="4.5">AA normal text, 4.5:1</option>
          </select>
        </div>
      </div>
      <GenerateButton label="Generate matching color" onGenerate={handleGenerate} />
      {inputError ? (
        <p id={errorId} className={styles.error}>
          {inputError}
        </p>
      ) : null}
      {resultNote ? (
        <p className={styles.error}>
          {resultNote}
        </p>
      ) : null}
      {pair ? (
        <>
          <ContrastPreview foreground={pair.foreground} background={pair.background} />
          <ContrastReadout
            foreground={pair.foreground}
            background={pair.background}
            ratio={pair.ratio}
            boundaries={[TARGET_RATIOS[target]]}
          />
        </>
      ) : null}
      <LiveStatus message={announcement} />
    </ToolFrame>
  );
}
