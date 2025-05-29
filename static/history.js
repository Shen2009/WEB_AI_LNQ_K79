function toggleMenu() {
  const menu = document.querySelector('.navbar-menu');
  menu.classList.toggle('active');
}

function clearHistory() {
  if (confirm('Bạn có chắc muốn xóa lịch sử trò chuyện không?')) {
    $.post('/clear_history', function(response) {
      if (response.status === 'success') {
        location.reload();
      } else {
        alert(response.message || 'Lỗi khi xóa lịch sử trò chuyện.');
      }
    }).fail(function() {
      alert('Lỗi khi gửi yêu cầu xóa lịch sử. Vui lòng thử lại.');
    });
  }
}

function filterHistory() {
  const searchInput = document.getElementById('search-input').value.toLowerCase();
  const dateFilter = document.getElementById('date-filter').value;
  const historyContent = document.getElementById('history-content');
  $.post('/filter_history', { search: searchInput, date: dateFilter }, function(response) {
    if (response.status === 'success') {
      historyContent.innerHTML = '';
      if (response.history.length > 0) {
        response.history.forEach(chat => {
          const wrapper = document.createElement('div');
          wrapper.className = 'message-wrapper';
          wrapper.innerHTML = `
            <div class="message user-message"><span>🗣 ${chat[0]}</span></div>
            <div class="datetime">${chat[2]}</div>
            <div class="message bot-message"><span style="white-space: pre-wrap;">🤖 ${chat[1]}</span></div>
            <div class="datetime">${chat[2]}</div>
            <hr>
          `;
          historyContent.appendChild(wrapper);
        });
      } else {
        historyContent.innerHTML = '<p>Không tìm thấy lịch sử phù hợp.</p>';
      }
    } else {
      alert('Lỗi khi lọc lịch sử: ' + (response.message || 'Vui lòng thử lại.'));
    }
  }).fail(function() {
    alert('Lỗi kết nối server khi lọc lịch sử.');
  });
}