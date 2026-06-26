export default function ArchivedHabitItem({ habit, onRestore, onDelete }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
        <span className="text-sm text-slate-700 dark:text-slate-200">{habit.title}</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onRestore(habit.id)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Восстановить
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"
        >
          Удалить навсегда
        </button>
      </div>
    </div>
  );
}
