import { habitGroupRepository } from "../repositories/habitGroup.repository.js";
import { habitLogRepository } from "../repositories/habitLog.repository.js";
import { calculateStreaks } from "../utils/calculateStreak.js";

async function assertOwnership(groupId, userId) {
  const group = await habitGroupRepository.findById(groupId);
  if (!group || group.user_id !== userId) {
    const err = new Error("Ритуал не найден");
    err.status = 404;
    throw err;
  }
  return group;
}

async function computeGroupStats(members) {
  if (members.length === 0) {
    return { currentStreak: 0, bestStreak: 0, completionRate: 0, completedDates: [] };
  }

  const allLogs = await Promise.all(members.map((h) => habitLogRepository.findByHabit(h.id)));
  const dateSets = allLogs.map(
    (logs) => new Set(logs.filter((l) => l.completed).map((l) => l.date.toISOString().slice(0, 10)))
  );

  let intersection = dateSets[0];
  for (let i = 1; i < dateSets.length; i++) {
    intersection = new Set([...intersection].filter((d) => dateSets[i].has(d)));
  }
  const completedDates = [...intersection];

  const startDate = members.reduce(
    (latest, h) => (new Date(h.start_date) > new Date(latest) ? h.start_date : latest),
    members[0].start_date
  );

  const stats = calculateStreaks(completedDates, startDate);
  return { ...stats, completedDates };
}

export const habitGroupService = {
  async list(userId) {
    const groups = await habitGroupRepository.findAllByUser(userId);
    return Promise.all(
      groups.map(async (group) => {
        const members = await habitGroupRepository.findMembers(group.id);
        const stats = await computeGroupStats(members);
        return { ...group, members, stats };
      })
    );
  },

  async create(userId, { title, color, habitIds }) {
    const group = await habitGroupRepository.create(userId, { title, color });
    await habitGroupRepository.setMembers(group.id, userId, habitIds);
    const members = await habitGroupRepository.findMembers(group.id);
    const stats = await computeGroupStats(members);
    return { ...group, members, stats };
  },

  async forGroup(userId, groupId) {
    const group = await assertOwnership(groupId, userId);
    const members = await habitGroupRepository.findMembers(group.id);
    const stats = await computeGroupStats(members);
    return { ...group, members, stats };
  },

  async update(userId, groupId, { title, color, habitIds }) {
    await assertOwnership(groupId, userId);
    const group = await habitGroupRepository.update(groupId, { title, color });
    if (habitIds) {
      await habitGroupRepository.setMembers(groupId, userId, habitIds);
    }
    const members = await habitGroupRepository.findMembers(groupId);
    const stats = await computeGroupStats(members);
    return { ...group, members, stats };
  },

  async remove(userId, groupId) {
    await assertOwnership(groupId, userId);
    await habitGroupRepository.remove(groupId);
  },
};
