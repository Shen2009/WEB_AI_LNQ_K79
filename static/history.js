function toggleMenu() {
  const menu = document.querySelector('.navbar-menu');
  menu.classList.toggle('active');
}

function clearHistory() {
  if (confirm('Bạn có chắc muốn xóa lịch sử trò chuyện?')) {
    $.post('/clear_history', function(response) {
      if (response.status === 'success') {
        location.reload();
      } else {
        alert('Lỗi khi xóa lịch sử: ' + response.message);
      }
    }).fail(function() {
      alert('Lỗi khi gửi yêu cầu xóa lịch sử...');
    });
  }
}