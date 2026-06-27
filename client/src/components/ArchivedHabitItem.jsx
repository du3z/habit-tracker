import { RotateCcw, Trash2 } from "lucide-react";

export default function ArchivedHabitItem({ habit, onRestore, onDelete }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
        <span className="text-sm text-slate-700 dark:text-slate-200">{habit.title}</span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onRestore(habit.id)}
          title="Восстановить"
          className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          <RotateCcw size={15} />
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          title="Удалить навсегда"
          className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
