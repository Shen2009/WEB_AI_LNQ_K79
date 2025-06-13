const form = document.getElementById('chat-form');
const textarea = form ? form.querySelector('textarea') : null;
const loading = document.getElementById('loading');
const chatBody = document.getElementById('chat-body');
const chatIcon = document.getElementById('chatbot-icon');
const chatContainer = document.getElementById('chat-container');
const closeBtn = document.querySelector('.close-btn');
const minimizeBtn = document.querySelector('.minimize-btn');

if (!form || !textarea || !loading || !chatBody || !chatIcon || !chatContainer || !closeBtn || !minimizeBtn) {
  console.error('Một hoặc nhiều phần tử DOM không được tìm thấy trong scripts.js:', {
    form, textarea, loading, chatBody, chatIcon, chatContainer, closeBtn, minimizeBtn
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
    console.log('Menu được chuyển đổi trạng thái:', menu.classList.contains('active') ? 'Mở' : 'Đóng');
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
      console.log('Chuyển sang chế độ tối');
    } else {
      moonIcon.classList.remove('fa-sun');
      moonIcon.classList.add('fa-moon');
      localStorage.setItem('theme', 'light');
      console.log('Chuyển sang chế độ sáng');
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
      chatContainer.style.display = 'none'; // Thêm: Ẩn khung chat
    } else {
      console.log('Hiển thị khung chat.');
      chatContainer.classList.add('visible');
      chatContainer.style.display = 'flex'; // Thêm: Hiển thị khung chat
      updateChatPosition(); // Cập nhật vị trí khung chat
      scrollToBottom();
    }
  } else {
    console.error('chatContainer không tồn tại.');
  }
}

function minimizeChat() {
  if (chatContainer) {
    console.log('Thu nhỏ khung chat.');
    chatContainer.classList.remove('visible');
    chatContainer.style.display = 'none'; // Thêm: Ẩn khung chat
  }
}

function clearAndCloseChat() {
  if (chatBody) chatBody.innerHTML = '';
  if (textarea) textarea.value = '';
  if (chatContainer) {
    console.log('Đóng và xóa khung chat.');
    chatContainer.classList.remove('visible');
    chatContainer.style.display = 'none'; // Thêm: Ẩn khung chat
  }
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
            <div class="datetime">${chat[2]}</div>
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
    console.log('Hiển thị trạng thái loading.');
  }
}

function hideLoading() {
  if (loading) {
    loading.style.display = 'none';
    if (textarea) textarea.disabled = false;
    console.log('Ẩn trạng thái loading.');
  }
}

function scrollToBottom() {
  if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight;
    console.log('Cuộn xuống cuối khung chat.');
  }
}

function startDragging(e) {
  if (e.button === 0) {
    e.preventDefault();
    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;
    isDragging = true;
    chatIcon.style.cursor = 'grabbing';
    console.log('Bắt đầu kéo chatbot icon.');
  }
}

function drag(e) {
  if (isDragging) {
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    // Giới hạn icon trong cửa sổ trình duyệt
    currentX = Math.max(0, Math.min(currentX, window.innerWidth - chatIcon.offsetWidth));
    currentY = Math.max(0, Math.min(currentY, window.innerHeight - chatIcon.offsetHeight));

    chatIcon.style.left = currentX + 'px';
    chatIcon.style.top = currentY + 'px';
    chatIcon.style.right = 'auto';
    chatIcon.style.bottom = 'auto';

    if (chatContainer.classList.contains('visible')) {
      updateChatPosition();
    }
    console.log('Đang kéo chatbot icon:', { currentX, currentY });
  }
}

function stopDragging() {
  if (isDragging) {
    isDragging = false;
    chatIcon.style.cursor = 'move';
    console.log('Dừng kéo chatbot icon.');
  }
}

function updateChatPosition() {
  const iconRect = chatIcon.getBoundingClientRect();
  const chatWidth = chatContainer.offsetWidth;
  const windowWidth = window.innerWidth;
  const margin = 10;

  // Đặt vị trí khung chat bên phải icon nếu đủ chỗ, ngược lại bên trái
  if (iconRect.left + chatWidth + margin > windowWidth) {
    chatContainer.style.left = (iconRect.left - chatWidth - margin) + 'px';
    chatContainer.style.right = 'auto';
  } else {
    chatContainer.style.left = (iconRect.left + chatIcon.offsetWidth + margin) + 'px';
    chatContainer.style.right = 'auto';
  }

  // Đặt khung chat ngay trên icon
  chatContainer.style.top = (iconRect.top - chatContainer.offsetHeight - margin) + 'px';
  chatContainer.style.bottom = 'auto';
  console.log('Cập nhật vị trí khung chat:', {
    left: chatContainer.style.left,
    top: chatContainer.style.top
  });
}

if (textarea) {
  textarea.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      showLoading();
      sendMessage();
      console.log('Nhấn Enter để gửi tin nhắn.');
    }
  });
}

if (chatIcon) {
  chatIcon.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);
  chatIcon.addEventListener('click', toggleChat);
}

if (closeBtn) {
  closeBtn.addEventListener('click', function() {
    clearAndCloseChat();
    console.log('Nút đóng được nhấp.');
  });
}

if (minimizeBtn) {
  minimizeBtn.addEventListener('click', function() {
    minimizeChat();
    console.log('Nút thu nhỏ được nhấp.');
  });
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
    console.log('Khởi tạo với chế độ tối.');
  }
  hideLoading();
  scrollToBottom();
  // Thêm: Khởi tạo vị trí ban đầu của icon và khung chat
  if (chatIcon) {
    chatIcon.style.left = 'auto';
    chatIcon.style.top = 'auto';
    chatIcon.style.right = '20px';
    chatIcon.style.bottom = '20px';
    // Tính toán currentX, currentY dựa trên vị trí ban đầu
    const iconRect = chatIcon.getBoundingClientRect();
    currentX = iconRect.left;
    currentY = iconRect.top;
  }
  if (chatContainer) {
    chatContainer.style.display = 'none'; // Đảm bảo khung chat ẩn ban đầu
    updateChatPosition(); // Đặt vị trí khung chat
  }
});
document.getElementById("contactForm").onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const formMessage = document.getElementById("formMessage");

  // Hiển thị hiệu ứng loading
  submitButton.classList.add('loading');
  submitButton.disabled = true; // Vô hiệu hóa nút
  formMessage.textContent = ''; // Xóa thông báo cũ

  try {
    const res = await fetch("/send_form", {
      method: "POST",
      body: formData
    });
    const result = await res.json();
    formMessage.textContent = result.message;
    if (result.status === "success") {
      form.reset();
      formMessage.style.color = "green";
    } else {
      formMessage.style.color = "red";
    }
  } catch (error) {
    formMessage.textContent = "Lỗi kết nối. Vui lòng thử lại.";
    formMessage.style.color = "red";
    console.error('Lỗi gửi biểu mẫu:', error);
  } finally {
    // Ẩn hiệu ứng loading
    submitButton.classList.remove('loading');
    submitButton.disabled = false; // Kích hoạt lại nút
  }
};
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Cấu hình middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Hoặc sử dụng SMTP của bạn (VD: Gmail, SendGrid)
  auth: {
    user: 'your-email@example.com', // Email của bạn
    pass: 'your-app-specific-password', // Mật khẩu ứng dụng (không phải mật khẩu email thông thường)
  }
});

// Xử lý endpoint /send_form
app.post('/send_form', async (req, res) => {
  try {
    const { name, email, message, phone } = req.body; // Giả sử biểu mẫu có các trường này

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng điền đầy đủ thông tin.'
      });
    }

    // Gửi email phản hồi đến người dùng
    const mailOptions = {
      from: 'your-email@example.com',
      to: email, // Email của người dùng
      subject: 'Xác nhận nhận được phản hồi từ bạn',
      text: `Chào ${name},\n\nCảm ơn bạn đã liên hệ với chúng tôi!\n\nChúng tôi đã nhận được tin nhắn của bạn:\n${message}\n\nChúng tôi sẽ phản hồi sớm nhất có thể.\n\nTrân trọng,\nYour Team`
    };

    await transporter.sendMail(mailOptions);

    // Gửi email thông báo cho admin (nếu cần)
    const adminMailOptions = {
      from: 'your-email@example.com',
      to: 'admin@example.com', // Email của admin
      subject: 'Phản hồi mới từ biểu mẫu liên hệ',
      text: `Có phản hồi mới từ:\nTên: ${name}\nEmail: ${email}\nĐiện thoại: ${phone || 'N/A'}\nTin nhắn: ${message}`
    };

    await transporter.sendMail(adminMailOptions);

    // Phản hồi thành công cho client
    res.json({
      status: 'success',
      message: 'Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ sớm.'
    });
  } catch (error) {
    console.error('Lỗi khi xử lý gửi biểu mẫu:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra khi gửi biểu mẫu. Vui lòng thử lại sau.'
    });
  }
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});

