import { last30Days, formatDate } from "../utils/dateHelpers.js";

export default function Calendar({ logs = [], color = "#6366f1" }) {
  const completedSet = new Set(logs.filter((l) => l.completed).map((l) => l.date));
  const days = last30Days();

  return (
    <div>
      <h4 className="text-sm font-medium text-slate-600 mb-2">Последние 30 дней</h4>
      <div className="grid grid-cols-10 gap-1.5">
        {days.map((day) => {
          const done = completedSet.has(day);
          return (
            <div
              key={day}
              title={`${formatDate(day)}${done ? " — выполнено" : ""}`}
              className="w-6 h-6 rounded-sm"
              style={{ backgroundColor: done ? color : "#e2e8f0" }}
            />
          );
        })}
      </div>
    </div>
  );
}
