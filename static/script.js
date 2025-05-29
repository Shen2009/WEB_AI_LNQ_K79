const form = document.getElementById('chat-form');
const textarea = form ? form.querySelector('textarea') : null;
const loading = document.getElementById('loading');
const chatBody = document.getElementById('chat-body');
const chatIcon = document.getElementById('chatbot-icon');
const chatContainer = document.getElementById('chat-container');

if (!form || !textarea || !loading || !chatBody || !chatIcon || !chatContainer) {
  console.error('Một hoặc nhiều phần tử DOM không được tìm thấy trong scripts.js:', {
    form, textarea, loading, chatBody, chatIcon, chatContainer
  });
} else {
  console.log('Tất cả phần tử DOM được tìm thấy.');
}

let isDragging = false;
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;

function toggleMenu() {
  const menu = document.getElementById('navbar-menu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const moonIcon = document.querySelector('.theme-toggle i');
  const isDarkMode = document.body.classList.contains('dark-mode');
  if (moonIcon) {
    if (isDarkMode) {
      moonIcon.classList.remove('fa-moon');
      moonIcon.classList.add('fa-sun');
      localStorage.setItem('theme', 'dark');
    } else {
      moonIcon.classList.remove('fa-sun');
      moonIcon.classList.add('fa-moon');
      localStorage.setItem('theme', 'light');
    }
  }
}

function toggleChat(event) {
  event.preventDefault();
  console.log('Icon chatbot được nhấp!');
  if (chatContainer) {
    console.log('Trạng thái hiện tại của chatContainer:', {
      classList: chatContainer.classList,
      style: chatContainer.style,
      offsetHeight: chatContainer.offsetHeight
    });
    if (chatContainer.classList.contains('visible')) {
      console.log('Ẩn khung chat.');
      chatContainer.classList.remove('visible');
    } else {
      console.log('Hiển thị khung chat.');
      chatContainer.classList.add('visible');
      chatContainer.style.display = 'flex';
      updateChatPosition();
    }
  } else {
    console.error('chatContainer không tồn tại.');
  }
}

function minimizeChat() {
  if (chatBody) chatBody.innerHTML = '';
  if (textarea) textarea.value = '';
  if (chatContainer) chatContainer.classList.remove('visible');
}

function clearAndCloseChat() {
  if (chatBody) chatBody.innerHTML = '';
  if (textarea) textarea.value = '';
  if (chatContainer) chatContainer.classList.remove('visible');
}

function sendMessage() {
  const input = textarea.value.trim();
  if (input) {
    showLoading();
    const timestamp = new Date().toLocaleString('vi-VN');
    console.log('Gửi tin nhắn:', { input, timestamp });
    $.post('/send_message', { input: input }, function(response) {
      console.log('Phản hồi từ server:', response);
      if (response && response.status === 'success') {
        if (!response.history || !Array.isArray(response.history)) {
          console.error('Dữ liệu lịch sử không hợp lệ:', response.history);
          hideLoading();
          alert('Lỗi: Dữ liệu lịch sử không đúng định dạng.');
          return;
        }
        chatBody.innerHTML = '';
        response.history.forEach(chat => {
          if (!Array.isArray(chat) || chat.length < 3) {
            console.error('Lịch sử không đúng định dạng:', chat);
            return;
          }
          const userDiv = document.createElement('div');
          userDiv.className = 'message-wrapper';
          userDiv.innerHTML = `
            <div class="message user-message"><span>${chat[0]}</span></div>
            <div class ECONOMY="datetime">${chat[2]}</div>
            <div class="message bot-message"><span style="white-space: pre-wrap;">${chat[1]}</span></div>
            <div class="datetime">${chat[2]}</div>
          `;
          chatBody.appendChild(userDiv);
        });
        textarea.value = '';
        hideLoading();
        scrollToBottom();
      } else {
        hideLoading();
        alert(response && response.message ? response.message : 'Lỗi khi gửi tin nhắn. Vui lòng thử lại.');
      }
    }).fail(function(jqXHR, textStatus, errorThrown) {
      hideLoading();
      alert(`Lỗi kết nối đến server: ${textStatus}. Vui lòng kiểm tra kết nối mạng và thử lại.`);
      console.error('Lỗi AJAX trong sendMessage:', textStatus, errorThrown, jqXHR);
    });
  } else {
    alert('Vui lòng nhập câu hỏi.');
  }
}

function fillSuggestion(text) {
  if (textarea) {
    textarea.value = text;
    sendMessage();
  }
}

function showLoading() {
  if (loading) {
    loading.style.display = 'flex';
    if (textarea) textarea.disabled = true;
  }
}

function hideLoading() {
  if (loading) {
    loading.style.display = 'none';
    if (textarea) textarea.disabled = false;
  }
}

function scrollToBottom() {
  if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
}

function startDragging(e) {
  if (e.button === 0) {
    e.preventDefault();
    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;
    isDragging = true;
    chatIcon.style.cursor = 'grabbing';
  }
}

function drag(e) {
  if (isDragging) {
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    currentX = Math.max(0, Math.min(currentX, window.innerWidth - chatIcon.offsetWidth));
    currentY = Math.max(0, Math.min(currentY, window.innerHeight - chatIcon.offsetHeight));

    chatIcon.style.left = currentX + 'px';
    chatIcon.style.top = currentY + 'px';
    chatIcon.style.right = 'auto';
    chatIcon.style.bottom = 'auto';

    if (chatContainer.classList.contains('visible')) {
      updateChatPosition();
    }
  }
}

function stopDragging() {
  if (isDragging) {
    isDragging = false;
    chatIcon.style.cursor = 'move';
  }
}

function updateChatPosition() {
  const iconRect = chatIcon.getBoundingClientRect();
  const chatWidth = chatContainer.offsetWidth;
  const windowWidth = window.innerWidth;
  const margin = 10;

  if (iconRect.left + chatWidth + margin > windowWidth) {
    chatContainer.style.left = (iconRect.left - chatWidth - margin) + 'px';
    chatContainer.style.right = 'auto';
  } else {
    chatContainer.style.left = (iconRect.left + chatIcon.offsetWidth + margin) + 'px';
    chatContainer.style.right = 'auto';
  }

  chatContainer.style.top = (iconRect.top - chatContainer.offsetHeight + chatIcon.offsetHeight + margin) + 'px';
  chatContainer.style.bottom = 'auto';
}

if (textarea) {
  textarea.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      showLoading();
      sendMessage();
    }
  });
}

if (chatIcon) {
  chatIcon.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);
  chatIcon.addEventListener('click', toggleChat);
}

window.addEventListener('load', function() {
  console.log('scripts.js được tải.');
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    const moonIcon = document.querySelector('.theme-toggle i');
    if (moonIcon) {
      moonIcon.classList.remove('fa-moon');
      moonIcon.classList.add('fa-sun');
    }
  }
  hideLoading();
  scrollToBottom();
});