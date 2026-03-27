// chat.js — lógica del widget de chat (frontend)
// Se carga desde index.html después del script principal

const chatMessages = document.getElementById('chat-messages');
const chatInput    = document.getElementById('chat-input');
const chatSend     = document.getElementById('chat-send');
const chatWindow   = document.getElementById('chat-window');
const chatBtn      = document.getElementById('chat-btn');
let chatOpen = false;

const SYSTEM_PROMPT = `You are the AI assistant for The Bull and The Moon, a technology agency with offices in Miami, Montevideo, Málaga and Bangalore. You help answer questions about the agency's services, projects and culture. Be concise, professional and friendly. Reply in the same language the user writes in.`;

function toggleChat() {
  chatOpen = !chatOpen;
  chatBtn.classList.toggle('open', chatOpen);
  chatWindow.classList.toggle('open', chatOpen);
  if (chatOpen && chatMessages.childElementCount === 0) {
    const lang = document.documentElement.lang || 'en';
    greetingDiv = addMessage('bot', BOT_GREET[lang] || BOT_GREET.en);
  }
  if (chatOpen) setTimeout(() => chatInput.focus(), 250);
}

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

async function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  chatSend.disabled = true;

  addMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  const lang = document.documentElement.lang || 'en';
  const typing = addMessage('bot', lang === 'es' ? 'Escribiendo…' : 'Typing…');
  typing.classList.add('typing');

  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: text, historial: chatHistory, sistema: SYSTEM_PROMPT })
    });
    const data = await res.json();
    const reply = data.respuesta || (lang === 'es' ? 'Error al obtener respuesta.' : 'Could not get a response.');
    typing.textContent = reply;
    typing.classList.remove('typing');
    chatHistory.push({ role: 'assistant', content: reply });
  } catch {
    typing.textContent = lang === 'es' ? 'Error de conexión. Inténtalo de nuevo.' : 'Connection error. Please try again.';
    typing.classList.remove('typing');
  }

  chatSend.disabled = false;
  chatInput.focus();
}
