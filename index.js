require('dotenv').config();
const tmi = require('tmi.js');
const axios = require('axios');

// === Configurar o bot da Twitch ===
const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH
  },
  channels: [process.env.TWITCH_CHANNEL]
});

client.connect();
console.log('🤖 Bot conectado à Twitch!');

// === Função para gerar resposta com Gemini ===
async function responderGemini(pergunta) {
  try {
    const res = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [{ parts: [{ text: pergunta }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY }
      }
    );
    

    const resposta = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return resposta || '❌ Não consegui responder.';
  } catch (err) {
    console.error('Erro ao chamar Gemini:', err.message);
    return '❌ Erro ao consultar a IA.';
  }
}

// === Escutar o chat e responder ===
client.on('message', async (channel, tags, message, self) => {
  if (self || !message.startsWith('!gpt ')) return;

  const pergunta = message.replace('!gpt ', '');
  const resposta = await responderGemini(pergunta);

  client.say(channel, `@${tags.username}, ${resposta.slice(0, 400)}`);
});

