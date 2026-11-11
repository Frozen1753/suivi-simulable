import { PaintRoller } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { applyTheme, resolveIsDark } from "../../../core/utils/theme/theme";
import { FloatingButton } from "../../components/floating-button";
import { Panel } from "../panel/Panel";
import {
  DEFAULT_SHIKI_DARK,
  DEFAULT_SHIKI_LIGHT,
  previewShikiThemes,
  SHIKI_DARK_VAR,
  SHIKI_LIGHT_VAR,
} from "../../../core/components/code/shiki-theme-vars";
import {
  formatColor,
  isColor,
  parseColor,
  toHex,
  type RGBA,
} from "./theme-color";
import styles from "./ThemePanel.module.css";

const MANAGED_SHIKI_VARS = new Set([SHIKI_LIGHT_VAR, SHIKI_DARK_VAR]);

interface ShikiThemeMeta {
  id: string;
  displayName: string;
  type: "light" | "dark";
}

type ShikiThemesByType = Record<
  "light" | "dark",
  { id: string; displayName: string }[]
>;

const EMPTY_SHIKI_THEMES: ShikiThemesByType = { light: [], dark: [] };

type Vars = Record<string, string>;
type PreviewMode = "light" | "dark";

interface ThemeApiResponse {
  light: Vars;
  dark: Vars;
}

/**
 * Applies (or clears) a set of CSS custom properties as inline styles on
 * <html>, which override :root/.dark from style.css without
 * writing anything to disk — this is the "preview" half of the panel.
 */
function applyPreview(vars: Vars) {
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(vars))
    root.style.setProperty(prop, value);
}
function clearPreview(props: string[]) {
  const root = document.documentElement;
  for (const prop of props) root.style.removeProperty(prop);
}

export function ThemePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [light, setLight] = useState<Vars>({});
  const [dark, setDark] = useState<Vars>({});
  const [previewMode, setPreviewMode] = useState<PreviewMode>("light");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [shikiThemesByType, setShikiThemesByType] =
    useState<ShikiThemesByType>(EMPTY_SHIKI_THEMES);

  // Theme catalog comes from the dev server (see shiki-themes-server-plugin.ts)
  // rather than importing 'shiki' here — keeps the package out of client source.
  useEffect(() => {
    fetch("/api/shiki-themes")
      .then((r) => r.json())
      .then((list: ShikiThemeMeta[]) => {
        const grouped: ShikiThemesByType = { light: [], dark: [] };
        for (const t of list)
          grouped[t.type].push({ id: t.id, displayName: t.displayName });
        setShikiThemesByType(grouped);
      })
      .catch(() => {
        // Non-fatal: the comboboxes just stay empty until the server is reachable.
      });
  }, []);

  // Load current values once, on first open.
  useEffect(() => {
    if (!isOpen || loaded) return;
    fetch("/api/theme")
      .then((r) => r.json())
      .then((data: ThemeApiResponse) => {
        setLight(data.light);
        setDark(data.dark);
        setLoaded(true);
        previewShikiThemes({
          light: data.light[SHIKI_LIGHT_VAR] ?? DEFAULT_SHIKI_LIGHT,
          dark: data.light[SHIKI_DARK_VAR] ?? DEFAULT_SHIKI_DARK,
        });
      })
      .catch((err) =>
        setMessage({ ok: false, text: `Could not load theme: ${err.message}` }),
      );
  }, [isOpen, loaded]);

  // Live preview whenever a value or the light/dark toggle changes.
  useEffect(() => {
    if (!loaded) return;
    applyTheme(previewMode === "dark");
    applyPreview(light);
    if (previewMode === "dark") applyPreview(dark);
  }, [light, dark, previewMode, loaded]);

  useEffect(() => {
    return () => {
      // Panel unmounted: drop the forced preview, let the page fall back to
      // its own default (e.g. prefers-color-scheme via CSS, if you use that
      // for first-load, or plain :root if you don't).
      applyTheme(resolveIsDark());
      clearPreview([...Object.keys(light), ...Object.keys(dark)]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colorVars = useMemo(
    () =>
      Object.keys(light).filter(
        (k) => isColor(light[k]) && !MANAGED_SHIKI_VARS.has(k),
      ),
    [light],
  );
  const otherVars = useMemo(
    () =>
      Object.keys(light).filter(
        (k) => !isColor(light[k]) && !MANAGED_SHIKI_VARS.has(k),
      ),
    [light],
  );

  const shikiLight = light[SHIKI_LIGHT_VAR] ?? DEFAULT_SHIKI_LIGHT;
  const shikiDark = light[SHIKI_DARK_VAR] ?? DEFAULT_SHIKI_DARK;

  function setShikiTheme(which: "light" | "dark", value: string) {
    const next = {
      light: which === "light" ? value : shikiLight,
      dark: which === "dark" ? value : shikiDark,
    };
    setLightVar(which === "light" ? SHIKI_LIGHT_VAR : SHIKI_DARK_VAR, value);
    previewShikiThemes(next);
  }

  function setLightVar(key: string, value: string) {
    setLight((prev) => ({ ...prev, [key]: value }));
  }
  function setDarkVar(key: string, value: string) {
    setDark((prev) => ({ ...prev, [key]: value }));
  }
  function clearDarkOverride(key: string) {
    setDark((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ light, dark }),
      });
      const data = await res.json();
      setMessage(
        data.ok
          ? { ok: true, text: "Saved to vars.css — Vite will hot-reload it." }
          : { ok: false, text: data.error ?? "Save failed." },
      );
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    clearPreview([...Object.keys(light), ...Object.keys(dark)]);
    setLoaded(false); // triggers a fresh GET next render
    setMessage(null);
  }

  return (
    <>
      <FloatingButton
        className={styles.rainbow}
        onClick={() => setIsOpen(true)}
        aria-label="Open theme panel"
        title="Edit theme"
      >
        <PaintRoller />
      </FloatingButton>

      <Panel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Theme"
        maxWidth="34rem"
        headerActions={
          <div
            className={styles.modeTabs}
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={previewMode === "light"}
              className={styles.modeTab}
              onClick={() => setPreviewMode("light")}
            >
              ☀ Light
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={previewMode === "dark"}
              className={styles.modeTab}
              onClick={() => setPreviewMode("dark")}
            >
              🌙 Dark
            </button>
          </div>
        }
        footer={
          <>
            <Panel.Button variant="secondary" onClick={handleReset}>
              Reset
            </Panel.Button>
            <Panel.Button onClick={handleSave} disabled={isSaving || !loaded}>
              {isSaving ? "Saving…" : "Save to vars.css"}
            </Panel.Button>
          </>
        }
      >
        {!loaded ? (
          <p className={styles.loading}>Loading current theme…</p>
        ) : (
          <>
            <Panel.Section legend="Colors">
              {colorVars.map((key) => {
                const value =
                  previewMode === "dark"
                    ? (dark[key] ?? light[key])
                    : light[key];
                const overridden = previewMode === "dark" && key in dark;
                const parsed: RGBA = parseColor(value) ?? {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 1,
                };
                const setVar =
                  previewMode === "dark" ? setDarkVar : setLightVar;

                function updateHue(hex: string) {
                  const next = parseColor(hex);
                  if (next) setVar(key, formatColor({ ...next, a: parsed.a }));
                }
                function updateAlpha(percent: number) {
                  setVar(key, formatColor({ ...parsed, a: percent / 100 }));
                }

                return (
                  <label key={key} className={styles.row}>
                    <span className={styles.name}>
                      {key}
                    </span>
                    <input
                      className={styles.swatch}
                      type="color"
                      value={toHex(parsed)}
                      onChange={(e) => updateHue(e.target.value)}
                    />
                    <input
                      type="range"
                      className={styles.alpha}
                      min={0}
                      max={100}
                      value={Math.round(parsed.a * 100)}
                      onChange={(e) => updateAlpha(Number(e.target.value))}
                      title={`Opacity: ${Math.round(parsed.a * 100)}%`}
                    />
                    <input
                      type="text"
                      className={styles.field}
                      value={value}
                      onChange={(e) => setVar(key, e.target.value)}
                    />
                    {previewMode === "dark" && (
                      <button
                        type="button"
                        className={styles.reset}
                        title="Use the same value as light mode"
                        disabled={!overridden}
                        onClick={() => clearDarkOverride(key)}
                      >
                        ↺
                      </button>
                    )}
                  </label>
                );
              })}
            </Panel.Section>

            <Panel.Section legend="Typography & sizes">
              {otherVars.map((key) => {
                const value =
                  previewMode === "dark"
                    ? (dark[key] ?? light[key])
                    : light[key];
                const overridden = previewMode === "dark" && key in dark;
                const setVar =
                  previewMode === "dark" ? setDarkVar : setLightVar;
                return (
                  <label key={key} className={styles.row}>
                    <span className={styles.name}>
                      {key}
                    </span>
                    <input
                      type="text"
                      className={styles.fieldFull}
                      value={value}
                      onChange={(e) => setVar(key, e.target.value)}
                    />
                    {previewMode === "dark" && (
                      <button
                        type="button"
                        className={styles.reset}
                        title="Use the same value as light mode"
                        disabled={!overridden}
                        onClick={() => clearDarkOverride(key)}
                      >
                        ↺
                      </button>
                    )}
                  </label>
                );
              })}
            </Panel.Section>

            <Panel.Section legend="Code syntax theme (Shiki)">
              <label className={styles.row}>
                <span className={styles.name}>
                  Light theme
                </span>
                <select
                  className={styles.fieldFull}
                  value={shikiLight}
                  onChange={(e) => setShikiTheme("light", e.target.value)}
                >
                  <optgroup label="Light themes">
                    {shikiThemesByType.light.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.displayName}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Dark themes">
                    {shikiThemesByType.dark.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.displayName}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
              <label className={styles.row}>
                <span className={styles.name}>
                  Dark theme
                </span>
                <select
                  className={styles.fieldFull}
                  value={shikiDark}
                  onChange={(e) => setShikiTheme("dark", e.target.value)}
                >
                  <optgroup label="Dark themes">
                    {shikiThemesByType.dark.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.displayName}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Light themes">
                    {shikiThemesByType.light.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.displayName}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
              <p className={styles.hint}>
                Applies live to any <code>Code</code> block on the page.
              </p>
            </Panel.Section>

            {message && (
              <p
                className={`${styles.message} ${message.ok ? styles.ok : styles.error}`}
              >
                {message.text}
              </p>
            )}
          </>
        )}
      </Panel>
    </>
  );
}
