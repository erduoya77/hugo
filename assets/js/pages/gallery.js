const baseUrl = "https://pan.erduoya.top/";
const apiUrl = "https://pan.erduoya.top/api/v2.1/share-links/5e8c9bbcbaf741e88ee7/dirents/";
const displaySize = "512";
const galleryElement = document.getElementById("gallery");
const loadingElement = document.getElementById("loading");

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function fetchImages() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.dirent_list.filter(item => !item.is_dir); // 只获取图片文件
  } catch (error) {
    console.error('获取图片列表失败:', error);
    return [];
  }
}

function createGalleryItem(item) {
  const displayUrl = baseUrl + item.encoded_thumbnail_src.replace("/48/", `/${displaySize}/`);
  const originalUrl = baseUrl + item.encoded_thumbnail_src.replace("/48/", "/2048/");

  const galleryItem = document.createElement("div");
  galleryItem.className = "gallery-item";

  const imgElement = document.createElement("img");
  imgElement.src = displayUrl;
  imgElement.alt = item.file_name;
  imgElement.loading = "lazy";
  imgElement.setAttribute('href', originalUrl); // 使用href属性存储原始图片URL

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `<p>${formatDate(item.last_modified)}</p>`;

  galleryItem.appendChild(imgElement);
  galleryItem.appendChild(overlay);

  return galleryItem;
}

async function initGallery() {
  try {
    const images = await fetchImages();
    images.forEach(item => {
      galleryElement.appendChild(createGalleryItem(item));
    });
  } catch (error) {
    console.error('初始化画廊失败:', error);
  } finally {
    loadingElement.style.display = "none";
  }
}

// 初始化画廊
document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  ViewImage.init();
}); 