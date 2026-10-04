import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AccentColor = "indigo" | "blue" | "purple" | "green" | "pink" | "orange";
export type DateFormatOption = "relative" | "absolute" | "iso";
export type TaskStatusOption = "todo" | "in-progress" | "backlog";

export interface AccentColorConfig {
  id: AccentColor;
  name: string;
  hex: string;
  hoverHex: string;
  sidebarAccentForeground: string;
}

export const ACCENT_COLORS: Record<AccentColor, AccentColorConfig> = {
  indigo: {
    id: "indigo",
    name: "Indigo",
    hex: "#4F46E5",
    hoverHex: "#4338CA",
    sidebarAccentForeground: "#818CF8",
  },
  blue: {
    id: "blue",
    name: "Blue",
    hex: "#2563EB",
    hoverHex: "#1D4ED8",
    sidebarAccentForeground: "#60A5FA",
  },
  purple: {
    id: "purple",
    name: "Purple",
    hex: "#9333EA",
    hoverHex: "#7E22CE",
    sidebarAccentForeground: "#C084FC",
  },
  green: {
    id: "green",
    name: "Green",
    hex: "#10B981",
    hoverHex: "#059669",
    sidebarAccentForeground: "#6EE7B7",
  },
  pink: {
    id: "pink",
    name: "Pink",
    hex: "#EC4899",
    hoverHex: "#DB2777",
    sidebarAccentForeground: "#F9A8D4",
  },
  orange: {
    id: "orange",
    name: "Orange",
    hex: "#F97316",
    hoverHex: "#EA580C",
    sidebarAccentForeground: "#FDBA74",
  },
};

interface PreferencesState {
  accentColor: AccentColor;
  showCompleted: boolean;
  defaultStatus: TaskStatusOption;
  dateFormat: DateFormatOption;
}

interface PreferencesContextType extends PreferencesState {
  setAccentColor: (color: AccentColor) => void;
  setShowCompleted: (show: boolean) => void;
  setDefaultStatus: (status: TaskStatusOption) => void;
  setDateFormat: (format: DateFormatOption) => void;
  formatTaskDate: (dateString?: string | null, compact?: boolean) => string | null;
}

const PREFERENCES_STORAGE_KEY = "taskflow_user_preferences";

const DEFAULT_PREFERENCES: PreferencesState = {
  accentColor: "indigo",
  showCompleted: true,
  defaultStatus: "todo",
  dateFormat: "relative",
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PreferencesState>(() => {
    const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });

  // Apply accent color CSS variables globally
  useEffect(() => {
    const colorConfig = ACCENT_COLORS[preferences.accentColor] || ACCENT_COLORS.indigo;
    const root = document.documentElement;

    root.style.setProperty("--primary", colorConfig.hex);
    root.style.setProperty("--ring", colorConfig.hex);
    root.style.setProperty("--sidebar-primary", colorConfig.hex);
    root.style.setProperty("--sidebar-accent-foreground", colorConfig.sidebarAccentForeground);
    root.style.setProperty("--color-primary", colorConfig.hex);
    root.style.setProperty("--color-ring", colorConfig.hex);

    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setAccentColor = (accentColor: AccentColor) => {
    setPreferences((prev) => ({ ...prev, accentColor }));
  };

  const setShowCompleted = (showCompleted: boolean) => {
    setPreferences((prev) => ({ ...prev, showCompleted }));
  };

  const setDefaultStatus = (defaultStatus: TaskStatusOption) => {
    setPreferences((prev) => ({ ...prev, defaultStatus }));
  };

  const setDateFormat = (dateFormat: DateFormatOption) => {
    setPreferences((prev) => ({ ...prev, dateFormat }));
  };

  const formatTaskDate = (dateString?: string | null, compact = false): string | null => {
    if (!dateString) return compact ? "No due date" : null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return compact ? "No due date" : null;

    if (preferences.dateFormat === "iso") {
      return dateString.includes("T") ? dateString.split("T")[0] : dateString;
    }

    if (preferences.dateFormat === "absolute") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    // Relative format:
    const now = new Date();
    const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((dDate.getTime() - nDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(compact ? { year: "numeric" } : {}),
    });
  };

  return (
    <PreferencesContext.Provider
      value={{
        ...preferences,
        setAccentColor,
        setShowCompleted,
        setDefaultStatus,
        setDateFormat,
        formatTaskDate,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
