const activeSessions = new Map();

const keyFor = (userId, role = "USER") => `${role}:${userId}`;

export const setActiveSession = (userId, role, token) => {
  activeSessions.set(keyFor(userId, role), token);
};

export const clearActiveSession = (userId, role) => {
  activeSessions.delete(keyFor(userId, role));
};

export const isActiveSession = (userId, role, token) => {
  return activeSessions.get(keyFor(userId, role)) === token;
};
