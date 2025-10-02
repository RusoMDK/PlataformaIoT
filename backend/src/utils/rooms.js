// src/utils/rooms.js
function roomForUser(userId) {
  return `u:${String(userId)}`;
}
module.exports = { roomForUser };
