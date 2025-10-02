// src/realtime/io.js
let _io = null;
let _dashNs = null;
let _agentNs = null;

function setIO(io, { dashNs, agentNs } = {}) {
  _io = io;
  _dashNs = dashNs || (io ? io.of('/dashboard') : null);
  _agentNs = agentNs || (io ? io.of('/agent') : null);
}

function getIO()      { return _io; }
function getDashNs()  { return _dashNs; }
function getAgentNs() { return _agentNs; }

module.exports = { setIO, getIO, getDashNs, getAgentNs };
