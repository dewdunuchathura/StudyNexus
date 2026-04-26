export function getJoinedGroupsStorageKey(user) {
  if (!user) return 'ss_joined_groups_guest';
  return `ss_joined_groups_${user.email || user._id || user.id || 'user'}`;
}

export function getJoinedGroupIds(user) {
  try {
    const stored = localStorage.getItem(getJoinedGroupsStorageKey(user));
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setJoinedGroupIds(user, groupIds) {
  localStorage.setItem(getJoinedGroupsStorageKey(user), JSON.stringify(groupIds));
}

export function isGroupJoined(user, groupId) {
  return getJoinedGroupIds(user).includes(groupId);
}

export function joinGroupForUser(user, groupId) {
  const current = getJoinedGroupIds(user);
  if (current.includes(groupId)) return current;

  const next = [...current, groupId];
  setJoinedGroupIds(user, next);
  return next;
}

export function leaveGroupForUser(user, groupId) {
  const next = getJoinedGroupIds(user).filter((id) => id !== groupId);
  setJoinedGroupIds(user, next);
  return next;
}
