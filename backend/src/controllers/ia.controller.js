// controllers/ia.controller.js
const { OpenAI } = require('openai');
const Dispositivo = require('../models/Dispositivo');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generarCodigo = async (req, res) => {
  try {
    const uid = req.params.uid?.toLowerCase();
    const dispositivo = await Dispositivo.findOne({
      uid,
      usuario: req.usuarioId,
    });

    if (!dispositivo) {
      return res.status(404).json({ msg: 'Dispositivo no encontrado' });
    }

    if (!Array.isArray(dispositivo.sensores) || dispositivo.sensores.length === 0) {
      return res.status(400).json({ msg: 'No hay sensores configurados para este dispositivo' });
    }

    const prompt = construirPrompt(dispositivo);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un generador experto de código Arduino. Devuelve solo el código sin explicaciones. Usa lenguaje Arduino (C++) compatible con la placa del usuario. Incluye setup y loop.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const codigo = completion.choices[0].message.content;

    res.json({ codigo });
  } catch (error) {
    console.error('❌ Error generando código:', error);
    res.status(500).json({ msg: 'Error generando código con IA' });
  }
};

function construirPrompt(dispositivo) {
  const { nombre, chip, sensores } = dispositivo;

  const lista = sensores
    .map(
      (s, i) =>
        `Sensor ${i + 1}: ${s.nombre} (Tipo: ${s.tipo}, Pin: ${s.pin}, Unidad: ${s.unidad || 'N/A'})`
    )
    .join('\n');

  return `Genera un sketch de Arduino para la placa "${nombre}" (Chip: ${chip}). Los sensores conectados son:\n${lista}\nNecesito que el código inicialice cada sensor en su pin correspondiente y muestre los datos por Serial cada segundo.`;
}
