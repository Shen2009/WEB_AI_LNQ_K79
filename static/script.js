const chatIcon = document.getElementById('chatbot-icon');
const chatContainer = document.getElementById('chat-container');
const form = document.getElementById('chat-form');
const textarea = form ? form.querySelector('textarea') : null;
const loading = document.getElementById('loading');
const chatBody = document.getElementById('chat-body');

let isDragging = false;
let initialX = 0;
let initialY = 0;
let currentX = 0;
let currentY = 0;
let clickStartTime = 0;
const dragThreshold = 200;

// Tính toán vị trí ban đầu của icon (góc dưới bên phải)
function setInitialPosition() {
  if (chatIcon) {
    const iconWidth = chatIcon.offsetWidth;
    const iconHeight = chatIcon.offsetHeight;
    currentX = window.innerWidth - iconWidth - 20; // 20px từ mép phải
    currentY = window.innerHeight - iconHeight - 20; // 20px từ mép dưới
    chatIcon.style.left = currentX + 'px';
    chatIcon.style.top = currentY + 'px';
    chatIcon.style.right = 'auto';
    chatIcon.style.bottom = 'auto';
    chatIcon.style.display = 'block';
  }
}

// Toggle menu với hiệu ứng trượt
function toggleMenu() {
  const menu = document.getElementById('navbar-menu');
  menu.classList.toggle('active');
}

// Chuyển đổi chế độ Dark/Light
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const moonIcon = document.querySelector('.theme-toggle i');
  if (document.body.classList.contains('dark-mode')) {
    moonIcon.classList.remove('fa-moon');
    moonIcon.classList.add('fa-sun');
  } else {
    moonIcon.classList.remove('fa-sun');
    moonIcon.classList.add('fa-moon');
  }
}

// Mở/đóng khung chat khi nhấp vào icon
function toggleChat(event) {
  event.preventDefault(); // Ngăn chặn hành vi mặc định
  if (!chatContainer) return; // Tránh lỗi nếu chatContainer không tồn tại
  if (chatContainer.classList.contains('visible')) {
    chatContainer.classList.remove('visible');
  } else {
    chatContainer.classList.add('visible');
    if (chatIcon) updateChatPosition();
  }
  if (chatIcon) chatIcon.style.display = 'block';
}

// Ẩn khung chat và xóa tin nhắn
function minimizeChat() {
  if (chatBody) chatBody.innerHTML = '';
  if (textarea) textarea.value = '';
  if (chatContainer) chatContainer.classList.remove('visible');
  if (chatIcon) chatIcon.style.display = 'block';
}

// Xóa dữ liệu và đóng khung chat
function clearAndCloseChat() {
  if (chatBody) chatBody.innerHTML = '';
  if (chatContainer) chatContainer.classList.remove('visible');
  if (textarea) textarea.value = '';
  if (chatIcon) chatIcon.style.display = 'block';
}

// Gửi tin nhắn bằng AJAX
function sendMessage() {
  const input = textarea.value.trim();
  if (input) {
    showLoading();
    $.post('/send_message', { input: input }, function(response) {
      if (response.status === 'success') {
        chatBody.innerHTML = ''; // Xóa nội dung cũ
        response.history.forEach(chat => {
          const userDiv = document.createElement('div');
          userDiv.className = 'message-wrapper';
          userDiv.innerHTML = `
            <div class="message user-message"><span>${chat[0]}</span></div>
            <div class="message bot-message"><span style="white-space: pre-wrap;">${chat[1]}</span></div>
          `;
          chatBody.appendChild(userDiv);
        });
        textarea.value = '';
        hideLoading();
        scrollToBottom();
      } else {
        hideLoading();
        alert(response.message);
      }
    }).fail(function() {
      hideLoading();
      alert('Lỗi khi gửi tin nhắn.');
    });
  } else {
    alert('Vui lòng nhập câu hỏi.');
  }
}

// Hiển thị loading
function showLoading() {
  if (loading) {
    loading.style.display = 'flex';
    if (textarea) textarea.disabled = true;
  }
}

// Ẩn loading
function hideLoading() {
  if (loading) {
    loading.style.display = 'none';
    if (textarea) textarea.disabled = false;
  }
}

// Gửi khi nhấn Enter
if (textarea) {
  textarea.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      showLoading();
      sendMessage();
    }
  });
}

// Cuộn xuống tin nhắn mới nhất
function scrollToBottom() {
  if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
}

// Cập nhật nội dung từ server
window.addEventListener('load', function() {
  hideLoading();
  scrollToBottom();
  setInitialPosition();
});

// Kéo thả biểu tượng chatbot (chỉ áp dụng trên trang chủ)
if (chatIcon) {
  chatIcon.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);
}

function startDragging(e) {
  if (e.button === 0) {
    e.preventDefault();
    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;
    clickStartTime = Date.now();
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

function stopDragging(e) {
  if (isDragging) {
    isDragging = false;
    chatIcon.style.cursor = 'move';
    const clickDuration = Date.now() - clickStartTime;
    if (clickDuration < dragThreshold) {
      // Không gọi toggleChat ở đây nữa vì đã xử lý trong sự kiện onclick
    }
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

window.addEventListener('resize', function() {
  if (chatContainer && chatContainer.classList.contains('visible')) {
    updateChatPosition();
  }
  setInitialPosition();
});