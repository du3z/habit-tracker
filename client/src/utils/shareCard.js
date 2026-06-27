// Генерирует красивую картинку 1080x1350 (формат для историй/постов) со стриком привычки.
// Работает чисто на Canvas API браузера, без внешних библиотек.

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function shade(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const amt = Math.round(2.55 * percent);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  return `rgb(${clamp(r + amt)}, ${clamp(g + amt)}, ${clamp(b + amt)})`;
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function generateStreakCard({ title, color, currentStreak, bestStreak, completionRate }) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // фон — диагональный градиент на основе цвета привычки
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, shade(color, 15));
  gradient.addColorStop(1, shade(color, -25));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // декоративные полупрозрачные круги
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(W * 0.85, H * 0.12, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W * 0.1, H * 0.92, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // бренд сверху
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 32px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Habit Tracker", 70, 110);

  // название привычки
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 48px system-ui, -apple-system, sans-serif";
  wrapText(ctx, title, 70, 220, W - 140, 56);

  // огромный номер стрика по центру
  ctx.textAlign = "center";
  ctx.font = "800 280px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(currentStreak), W / 2, H / 2 + 60);

  ctx.font = "500 40px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(currentStreak === 1 ? "день подряд 🔥" : "дней подряд 🔥", W / 2, H / 2 + 130);

  // нижняя плашка со статами
  const cardY = H - 260;
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  roundedRect(ctx, 70, cardY, W - 140, 160, 24);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 44px system-ui, -apple-system, sans-serif";
  const col1 = W / 2 - (W - 140) / 4;
  const col2 = W / 2 + (W - 140) / 4;
  ctx.fillText(String(bestStreak), col1, cardY + 75);
  ctx.fillText(`${completionRate}%`, col2, cardY + 75);

  ctx.font = "400 26px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("лучший стрик", col1, cardY + 115);
  ctx.fillText("выполнения", col2, cardY + 115);

  return canvas.toDataURL("image/png");
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}
