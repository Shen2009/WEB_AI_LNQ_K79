// Hàm cập nhật bản đồ với tọa độ và mức zoom
function updateMap(lat, lng, zoom = 14) {
  const mapIframe = document.getElementById('map-iframe');
  if (mapIframe) {
    const newSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3740.0!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}%2C${lng}!5e0!3m2!1svi!2s!4v${Date.now()}&z=${zoom}`;
    mapIframe.src = newSrc;
  } else {
    console.error('map-iframe not found');
  }
}

// Hàm chuyển đổi chế độ toàn màn hình
function toggleFullscreen() {
  const mapContainer = document.querySelector('.map-container-enhanced');
  if (mapContainer) {
    if (!mapContainer.classList.contains('fullscreen')) {
      mapContainer.classList.add('fullscreen');
      document.querySelector('.fullscreen-btn').textContent = 'Thoát toàn màn hình';
    } else {
      mapContainer.classList.remove('fullscreen');
      document.querySelector('.fullscreen-btn').textContent = 'Toàn màn hình';
    }
  } else {
    console.error('map-container-enhanced not found');
  }
}

// Gắn sự kiện cho nút toàn màn hình khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
  const fullscreenBtn = document.querySelector('.fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  } else {
    console.error('fullscreen-btn not found');
  }
});