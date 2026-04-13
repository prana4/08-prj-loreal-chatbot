/* ========================================
   L'ORÉAL BEAUTY ASSISTANT - JAVASCRIPT
   Features: OpenAI API + All 3 LevelUps (25 pts)
   ======================================== */

// DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// ===== LEVELUP 1: CONVERSATION HISTORY (10 pts) =====
// Maintain full conversation context including user name and past questions
let conversationHistory = [
  {
    role: "system",
    content: `You are an expert L'Oréal Beauty Assistant with deep knowledge of all L'Oréal products and beauty expertise. Your role is to help users discover and understand L'Oréal's extensive product range across makeup, skincare, haircare, and fragrances, as well as provide personalized routines and recommendations.

IMPORTANT GUIDELINES:
1. ONLY discuss L'Oréal products, routines, and beauty-related topics
2. Politely decline questions unrelated to L'Oréal or beauty
3. Be warm, helpful, and enthusiastic about beauty
4. Ask follow-up questions to better understand user needs (skin type, concerns, preferences)
5. Provide specific L'Oréal product recommendations when relevant
6. Remember context from earlier in the conversation
7. Keep responses conversational and concise (2-4 paragraphs maximum)
8. Use emojis sparingly for warmth (✨💄🌸)

L'Oréal Product Categories:
- MAKEUP: Foundations, lipsticks, mascaras, eyeshadows (Infallible, True Match, Colour Riche lines)
- SKINCARE: Serums, moisturizers, cleansers (Revitalift, Age Perfect, Hydra Genius lines)
- HAIRCARE: Shampoos, conditioners, treatments (Elvive, Total Repair, Color Vibrancy lines)
- FRAGRANCES: Various perfumes and body mists

If asked about topics outside of L'Oréal or beauty, politely respond: "I'm specialized in helping you with L'Oréal products and beauty advice. Is there anything about makeup, skincare, haircare, or fragrances I can help you with today?"`,
  },
];

// User context (name, preferences) - tracked across conversation
let userName = null;

// ===== API CONFIGURATION =====
// IMPORTANT: Replace this with your Cloudflare Worker URL after deployment
const CLOUDFLARE_WORKER_URL =
  "https://loreal-beauty-assistant.prana4.workers.dev/";

// For local testing with secrets.js (remove before deployment)
const USE_LOCAL_TESTING = false; // Set to false when using Cloudflare Worker

// ===== MAIN FUNCTION: Handle form submission =====
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("🚀 Form submitted!");

  const message = userInput.value.trim();
  if (!message) {
    console.log("❌ Empty message, returning");
    return;
  }

  console.log("📝 User message:", message);

  // Clear input and disable form
  userInput.value = "";
  setFormDisabled(true);

  // ===== LEVELUP 2: DISPLAY USER QUESTION (5 pts) =====
  // Display user's question in chat before getting response
  displayUserMessage(message);

  // Add user message to conversation history
  conversationHistory.push({
    role: "user",
    content: message,
  });

  console.log(
    "💬 Conversation history:",
    conversationHistory.length,
    "messages",
  );

  // Show loading indicator
  const loadingId = showLoadingMessage();

  try {
    console.log("🔄 Getting AI response...");

    // Get AI response
    const aiResponse = await getAIResponse();

    console.log(
      "✅ AI response received:",
      aiResponse.substring(0, 50) + "...",
    );

    // Remove loading indicator
    removeLoadingMessage(loadingId);

    // ===== LEVELUP 3: CHAT CONVERSATION UI (10 pts) =====
    // Display AI response in styled bubble
    displayAIMessage(aiResponse);

    // Add AI response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: aiResponse,
    });

    // Scroll to bottom
    scrollToBottom();
  } catch (error) {
    console.error("❌ ERROR:", error);
    console.error("Error details:", error.message);
    console.error("Full error:", error);

    removeLoadingMessage(loadingId);
    displayErrorMessage(error.message || "Unknown error occurred");
  } finally {
    setFormDisabled(false);
    userInput.focus();
  }
});

// ===== DISPLAY USER MESSAGE =====
function displayUserMessage(message) {
  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container user-message";

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = "You";

  const bubble = document.createElement("div");
  bubble.className = "user-bubble";
  bubble.innerHTML = `<p>${escapeHtml(message)}</p>`;

  messageContainer.appendChild(label);
  messageContainer.appendChild(bubble);

  // Remove welcome message if present
  const welcomeMsg = chatWindow.querySelector(".welcome-message");
  if (welcomeMsg) {
    welcomeMsg.remove();
  }

  chatWindow.appendChild(messageContainer);
  scrollToBottom();
}

// ===== DISPLAY AI MESSAGE =====
function displayAIMessage(message) {
  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container ai-message";

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = "L'Oréal Assistant";

  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";

  // Convert line breaks to paragraphs for better formatting
  const paragraphs = message.split("\n\n").filter((p) => p.trim());
  bubble.innerHTML = paragraphs
    .map((p) => `<p>${formatMarkdown(p.trim())}</p>`)
    .join("");

  messageContainer.appendChild(label);
  messageContainer.appendChild(bubble);
  chatWindow.appendChild(messageContainer);
  scrollToBottom();
}

// ===== SHOW LOADING MESSAGE =====
function showLoadingMessage() {
  const loadingId = `loading-${Date.now()}`;

  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container ai-message";
  messageContainer.id = loadingId;

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = "L'Oréal Assistant";

  const bubble = document.createElement("div");
  bubble.className = "loading-bubble";
  bubble.innerHTML = `
    <div class="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  messageContainer.appendChild(label);
  messageContainer.appendChild(bubble);
  chatWindow.appendChild(messageContainer);
  scrollToBottom();

  return loadingId;
}

// ===== REMOVE LOADING MESSAGE =====
function removeLoadingMessage(loadingId) {
  const loadingElement = document.getElementById(loadingId);
  if (loadingElement) {
    loadingElement.remove();
  }
}

// ===== DISPLAY ERROR MESSAGE =====
function displayErrorMessage(errorMsg) {
  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container ai-message";

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = "System";

  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";
  bubble.style.borderColor = "#ff0000";
  bubble.innerHTML = `<p>⚠️ Sorry, I encountered an error: ${escapeHtml(errorMsg)}. Please try again.</p>`;

  messageContainer.appendChild(label);
  messageContainer.appendChild(bubble);
  chatWindow.appendChild(messageContainer);
  scrollToBottom();
}

// ===== GET AI RESPONSE FROM OPENAI API =====
async function getAIResponse() {
  if (USE_LOCAL_TESTING && typeof OPENAI_API_KEY !== "undefined") {
    // LOCAL TESTING: Direct OpenAI API call (remove before deployment)
    return await getAIResponseLocal();
  } else {
    // PRODUCTION: Use Cloudflare Worker
    return await getAIResponseCloudflare();
  }
}

// ===== LOCAL TESTING: Direct OpenAI API =====
async function getAIResponseLocal() {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: conversationHistory,
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "API request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ===== PRODUCTION: Cloudflare Worker API =====
async function getAIResponseCloudflare() {
  const response = await fetch(CLOUDFLARE_WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: conversationHistory,
    }),
  });

  if (!response.ok) {
    throw new Error("Cloudflare Worker request failed");
  }

  const data = await response.json();

  // Extract response from Cloudflare Worker format
  return data.choices[0].message.content;
}

// ===== UTILITY FUNCTIONS =====
function setFormDisabled(disabled) {
  sendBtn.disabled = disabled;
  userInput.disabled = disabled;
}

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Format markdown-style bold text (**text** -> <strong>text</strong>)
function formatMarkdown(text) {
  // First escape HTML to prevent XSS attacks
  let formatted = escapeHtml(text);

  // Then convert **bold** to <strong>bold</strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  return formatted;
}

// ===== INITIALIZE =====
// Focus input on page load
window.addEventListener("load", () => {
  userInput.focus();
});

// Handle Enter key (already handled by form submit, but good to be explicit)
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});
