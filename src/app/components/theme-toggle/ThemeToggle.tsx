import { Moon, Sun } from "lucide-react";
import { applyTheme, saveTheme } from "../../../core/utils/theme/theme";
import { useCurrentTheme } from "../../../core/utils/theme/useCurrentTheme";
import { FloatingButton } from "../floating-button";

/**
 * The class on <html> is the source of truth, set before first paint by the
 * anti-flash script in index.html. No local state, so the icon can never
 * drift from the page (ThemePanel's preview included).
 */
export function ThemeToggle() {
  const isDark = useCurrentTheme() === "dark";

  function toggle() {
    const next = !isDark;
    applyTheme(next);
    saveTheme(next);
  }

  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <FloatingButton onClick={toggle} aria-label={label} title={label}>
      {isDark ? <Sun /> : <Moon />}
    </FloatingButton>
  );
}
