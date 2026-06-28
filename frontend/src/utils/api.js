const DISEASE_API_BASE_URL =
  process.env.NEXT_PUBLIC_DISEASE_API_URL ||
  "https://agrisence-plant-disease-detection.onrender.com";
const RAG_API_BASE_URL =
  process.env.NEXT_PUBLIC_RAG_API_URL || "https://agrisence.onrender.com";
const APP_API_BASE_URL =
  process.env.NEXT_PUBLIC_APP_API_URL ||
  "https://agrisence-backend.onrender.com/api";

async function readJson(response) {
  return response.json().catch(() => ({}));
}

export async function predictDisease(imageFile, topK = 3) {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch(`${DISEASE_API_BASE_URL}/predict?top_k=${topK}`, {
    method: "POST",
    body: formData,
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(
      data.detail || `Prediction failed with status ${response.status}`
    );
  }

  return data.data || data;
}

export async function getDiseaseInfo(diseaseName) {
  const response = await fetch(
    `${DISEASE_API_BASE_URL}/disease-info/${encodeURIComponent(diseaseName)}`
  );

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(
      data.detail || `Disease info failed with status ${response.status}`
    );
  }

  return data.info || data;
}

export async function getDiseaseClasses() {
  const response = await fetch(`${DISEASE_API_BASE_URL}/classes`);
  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(
      data.detail || `Classes request failed with status ${response.status}`
    );
  }
  return data;
}

export async function checkAPIHealth() {
  const response = await fetch(`${DISEASE_API_BASE_URL}/health`);
  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(
      data.detail || `Health check failed with status ${response.status}`
    );
  }
  return data;
}

export async function askRagAssistant({ question, language, chatHistory }) {
  const response = await fetch(`${RAG_API_BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      language,
      chat_history: chatHistory || [],
    }),
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(
      data.detail || `RAG request failed with status ${response.status}`
    );
  }
  return data;
}

export async function translateAssistantText({ text, language }) {
  const response = await fetch(`${RAG_API_BASE_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(
      data.detail || `Translation failed with status ${response.status}`
    );
  }
  return data;
}

export async function speakText({ text, language }) {
  const response = await fetch(`${RAG_API_BASE_URL}/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    const data = await readJson(response);
    throw new Error(
      data.detail || `Text-to-speech failed with status ${response.status}`
    );
  }

  return response.blob();
}

export async function saveChatSession({
  token,
  sessionId,
  title,
  language,
  messages,
}) {
  const response = await fetch(`${APP_API_BASE_URL}/chat-history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId, title, language, messages }),
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(
      data.message || `Save chat failed with status ${response.status}`
    );
  }
  return data;
}

export async function getChatSessions(token) {
  const response = await fetch(`${APP_API_BASE_URL}/chat-history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(
      data.message || `Fetch chat history failed with status ${response.status}`
    );
  }
  return data;
}

export async function getChatSession({ token, sessionId }) {
  const response = await fetch(`${APP_API_BASE_URL}/chat-history/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(
      data.message || `Fetch chat failed with status ${response.status}`
    );
  }
  return data;
}

export async function deleteChatSession({ token, sessionId }) {
  const response = await fetch(`${APP_API_BASE_URL}/chat-history/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(
      data.message || `Delete chat failed with status ${response.status}`
    );
  }
  return data;
}
