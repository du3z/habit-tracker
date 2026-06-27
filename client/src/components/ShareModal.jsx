import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { generateStreakCard } from "../utils/shareCard.js";

export default function ShareModal({ habit, stats, onClose }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    const url = generateStreakCard({
      title: habit.title,
      color: habit.color,
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak,
      completionRate: stats.completionRate,
    });
    setImageUrl(url);
    setCanShare(typeof navigator.share === "function");
  }, [habit, stats]);

  async function handleShare() {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], `${habit.title}-streak.png`, { type: "image/png" });
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        handleDownload();
        return;
      }
      await navigator.share({
        files: [file],
        title: "Habit Tracker",
        text: `${habit.title} — ${stats.currentStreak} дней подряд 🔥`,
      });
    } catch {
      // пользователь отменил шеринг или браузер не поддерживает — просто молчим
    }
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${habit.title}-streak.png`;
    a.click();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Поделиться прогрессом</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {imageUrl ? (
          <img src={imageUrl} alt="Стрик" className="w-full rounded-xl mb-4" />
        ) : (
          <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-700 rounded-xl mb-4 animate-pulse" />
        )}

        <div className="flex gap-2">
          {canShare && (
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium rounded-md py-2.5 hover:bg-indigo-700"
            >
              <Share2 size={16} />
              Поделиться
            </button>
          )}
          <button
            onClick={handleDownload}
            className={`flex items-center justify-center gap-2 text-sm font-medium rounded-md py-2.5 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 ${
              canShare ? "" : "flex-1"
            }`}
          >
            <Download size={16} />
            Скачать
          </button>
        </div>
      </div>
    </div>
  );
}
