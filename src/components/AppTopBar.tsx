import "./AppTopBar.css";

interface ThemeOption {
  value: string;
  label: string;
}

interface AppTopBarProps {
  theme: string;
  options: ThemeOption[];
  onThemeChange: (nextTheme: string) => void;
}

export default function AppTopBar({ theme, options, onThemeChange }: AppTopBarProps) {
  return (
    <div className="app-topbar">
      <h1>Event Management System</h1>
      <label className="app-theme-picker">
        Theme
        <select value={theme} onChange={(e) => onThemeChange(e.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
