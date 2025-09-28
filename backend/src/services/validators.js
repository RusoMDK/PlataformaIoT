const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ removeAdditional: true, allErrors: true, strict: false });
addFormats(ajv);

const telemetrySchemaV1 = {
  $id: 'telemetry.v1',
  type: 'object',
  required: ['ts','value'],
  additionalProperties: true,
  properties: {
    sensorId: { type: 'string' },
    ts: { type: 'number' },       // ms epoch
    value: { type: ['number','string','boolean','object','array'] },
    unit: { type: 'string' },
    meta: { type: 'object' }
  }
};

ajv.addSchema(telemetrySchemaV1);

module.exports = {
  validateTelemetry: ajv.getSchema('telemetry.v1'),
};
