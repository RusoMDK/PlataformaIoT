function base(orgOrUser, projectId, deviceId) {
  return `iot/${orgOrUser}/${projectId}/${deviceId}`;
}

module.exports = {
  base,
  state: (o,p,d) => `${base(o,p,d)}/state`,
  telemetry: (o,p,d) => `${base(o,p,d)}/telemetry/+`,
  telemetryBatch: (o,p,d) => `${base(o,p,d)}/telemetry/_batch`,
  cmd: (o,p,d) => `${base(o,p,d)}/cmd`,
  cmdAck: (o,p,d) => `${base(o,p,d)}/cmdAck`,
};
