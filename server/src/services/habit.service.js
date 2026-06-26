import { habitRepository } from "../repositories/habit.repository.js";
import { habitLogRepository } from "../repositories/habitLog.repository.js";

async function assertOwnership(habitId, userId) {
  const habit = await habitRepository.findById(habitId);
  if (!habit || habit.user_id !== userId) {
    const err = new Error("Привычка не найдена");
    err.status = 404;
    throw err;
  }
  return habit;
}

export const habitService = {
  async list(userId, filters) {
    return habitRepository.findAllByUser(userId, filters);
  },

  async create(userId, data) {
    return habitRepository.create(userId, data);
  },

  async update(userId, habitId, data) {
    await assertOwnership(habitId, userId);
    return habitRepository.update(habitId, data);
  },

  async remove(userId, habitId) {
    await assertOwnership(habitId, userId);
    await habitRepository.remove(habitId);
  },

  async complete(userId, habitId) {
    await assertOwnership(habitId, userId);
    return habitRepository.markCompleted(habitId);
  },

  async reopen(userId, habitId) {
    await assertOwnership(habitId, userId);
    return habitRepository.markActive(habitId);
  },

  async toggle(userId, habitId, date) {
    await assertOwnership(habitId, userId);
    return habitLogRepository.upsertToggle(habitId, date);
  },

  async logs(userId, habitId) {
    await assertOwnership(habitId, userId);
    return habitLogRepository.findByHabit(habitId);
  },
};
