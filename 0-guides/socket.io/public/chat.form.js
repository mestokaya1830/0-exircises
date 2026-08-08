const initForm = () => {
  const widgetHTML = `  <div class="chat-widget">
    <!-- Chat Window (Collapsed by default) -->
    <div class="chat-box collapsed" id="chatBox">
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-user-info">
          <div class="avatar">AI</div>
          <div class="chat-title">
            <h4>Support Assistant</h4>
            <p>Online</p>
          </div>
        </div>
        <button class="minimize-btn" id="minimizeBtn" title="Minimize">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <!-- Messages List -->
      <div class="chat-messages" id="chatMessages">
        <div class="message received">Hello! How can I help you today?</div>
      </div>

      <!-- Input Area -->
      <form class="chat-input-area" id="chatForm">
        <input type="text" class="chat-input" id="chatInput" placeholder="Type a message..." autocomplete="off">
        <button type="submit" class="send-btn">Send</button>
      </form>
    </div>

    <!-- Trigger Button -->
    <button class="chat-trigger" id="chatTrigger">
      <svg id="iconChat" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <svg id="iconClose" viewBox="0 0 24 24" style="display: none;">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>`;

  //load css
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'http://localhost:4001/chat.css';
  document.head.appendChild(link);

  //load js in body
  document.body.insertAdjacentHTML("beforeend", widgetHTML);
};

export default initForm;
