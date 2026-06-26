import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useThemeStore } from "../store/theme.store.js";

function useChartColors() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";
  return {
    grid: isDark ? "#334155" : "#e2e8f0",
    tick: isDark ? "#94a3b8" : "#64748b",
    tooltipBg: isDark ? "#1e293b" : "#ffffff",
    tooltipBorder: isDark ? "#334155" : "#e2e8f0",
    tooltipText: isDark ? "#f1f5f9" : "#1e293b",
  };
}

export function ProgressLineChart({ data, color = "#6366f1" }) {
  const c = useChartColors();
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: c.tick }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: c.tick }} />
        <Tooltip
          contentStyle={{ backgroundColor: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, fontSize: 12 }}
          labelStyle={{ color: c.tooltipText }}
        />
        <Line type="monotone" dataKey="completed" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WeeklyBarChart({ data, color = "#6366f1" }) {
  const c = useChartColors();
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: c.tick }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: c.tick }} />
        <Tooltip
          contentStyle={{ backgroundColor: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, fontSize: 12 }}
          labelStyle={{ color: c.tooltipText }}
        />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
