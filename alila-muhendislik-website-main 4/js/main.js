
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initMobileMenu();
  initScrollAnimations();
  highlightActiveLinks();
  if (document.getElementById('project-list')) loadProjects();
  if (document.getElementById('detail-title')) loadProjectDetail();
});

function initAOS() {
  if (window.AOS && typeof window.AOS.init === 'function') {
    window.AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 90 });
  }
}

function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open', navMenu.classList.contains('active'));
    hamburger.setAttribute('aria-expanded', String(navMenu.classList.contains('active')));
    hamburger.innerHTML = navMenu.classList.contains('active')
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  document.querySelectorAll('.dropdown > .nav-link').forEach(link => {
    link.addEventListener('click', event => {
      if (window.innerWidth > 992) return;
      const parent = link.parentElement;
      if (!parent) return;
      event.preventDefault();
      parent.classList.toggle('open');
    });
  });

  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth > 992) return;
      if (!link.closest('.dropdown-content')) {
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  });
}

function initScrollAnimations() {
  const items = document.querySelectorAll('.fade-up');
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(item => observer.observe(item));
}

function highlightActiveLinks() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === current) link.classList.add('active');
  });
}

function isEnglish() {
  return document.documentElement.lang.toLowerCase().startsWith('en');
}

function dataPath() {
  return isEnglish() ? '../data/projects.json' : 'data/projects.json';
}

function assetPath(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return isEnglish() ? `../${path}` : path;
}

function detailPagePath(id) {
  return `proje-detay.html?id=${id}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function fetchProjects() {
  const response = await fetch(dataPath(), { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function normalizeText(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getQueryFilters() {
  const params = new URLSearchParams(window.location.search);
  return {
    status: params.get('status'),
    category: params.get('category'),
    id: params.get('id')
  };
}

function filterProjects(projects) {
  const { status, category } = getQueryFilters();
  let filtered = [...projects];
  if (status === 'tamamlandi') {
    filtered = filtered.filter(project => {
      const value = normalizeText(project.status);
      return value.includes('tamamlandi') || value.includes('completed');
    });
  } else if (status === 'devam-ediyor') {
    filtered = filtered.filter(project => {
      const value = normalizeText(project.status);
      return value.includes('devam ediyor') || value.includes('in progress');
    });
  }

  if (category === 'altyapi') {
    filtered = filtered.filter(project => normalizeText(project.category).includes('altyapi') || normalizeText(project.category).includes('infrastructure'));
  } else if (category === 'konut') {
    filtered = filtered.filter(project => ['konut', 'ustyapi', 'üstyapi', 'residential'].some(item => normalizeText(project.category).includes(normalizeText(item))));
  } else if (category === 'endustriyel') {
    filtered = filtered.filter(project => normalizeText(project.category).includes('endustriyel') || normalizeText(project.category).includes('industrial'));
  }
  return filtered;
}

function createFilterBar() {
  const { status } = getQueryFilters();
  const labels = isEnglish()
    ? {
        all: 'All Projects',
        completed: 'Completed',
        ongoing: 'In Progress'
      }
    : {
        all: 'Tüm Projeler',
        completed: 'Tamamlanan',
        ongoing: 'Devam Eden'
      };

  return `
    <div class="filter-bar fade-up is-visible">
      <a class="filter-chip ${!status ? 'active' : ''}" href="projeler.html">${labels.all}</a>
      <a class="filter-chip ${status === 'tamamlandi' ? 'active' : ''}" href="projeler.html?status=tamamlandi">${labels.completed}</a>
      <a class="filter-chip ${status === 'devam-ediyor' ? 'active' : ''}" href="projeler.html?status=devam-ediyor">${labels.ongoing}</a>
    </div>
  `;
}

async function loadProjects() {
  const projectList = document.getElementById('project-list');
  if (!projectList) return;
  try {
    const projects = filterProjects(await fetchProjects());
    const emptyText = isEnglish()
      ? 'There are no projects matching this filter yet.'
      : 'Bu filtreye uygun proje henüz bulunmuyor.';

    const filterBarHost = document.getElementById('project-filter-bar');
    if (filterBarHost) filterBarHost.innerHTML = createFilterBar();

    if (!projects.length) {
      projectList.innerHTML = `<div class="empty-state">${emptyText}</div>`;
      return;
    }

    projectList.innerHTML = projects.map(project => `
      <a href="${detailPagePath(project.id)}" class="project-card fade-up">
        <div class="status-badge">${escapeHtml(project.status)}</div>
        <img src="${assetPath(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy">
        <div class="card-info">
          <span class="category">${escapeHtml(project.category)}</span>
          <h3>${escapeHtml(project.title)}</h3>
          <p class="location"><i class="fas fa-map-marker-alt"></i>${escapeHtml(project.location)}</p>
        </div>
      </a>
    `).join('');
    initScrollAnimations();
  } catch (error) {
    console.error('Projects could not be loaded:', error);
    projectList.innerHTML = `<div class="empty-state">${isEnglish() ? 'Project data could not be loaded.' : 'Proje verileri yüklenemedi.'}</div>`;
  }
}

async function loadProjectDetail() {
  const titleNode = document.getElementById('detail-title');
  if (!titleNode) return;
  try {
    const { id } = getQueryFilters();
    if (!id) return;
    const projects = await fetchProjects();
    const project = projects.find(item => String(item.id) === String(id));
    if (!project) {
      titleNode.textContent = isEnglish() ? 'Project Not Found' : 'Proje Bulunamadı';
      return;
    }

    document.title = `${project.title} | ${isEnglish() ? 'Alila Engineering' : 'Alila Mühendislik'}`;
    titleNode.textContent = project.title;
    setText('detail-category', project.category);
    setText('detail-status', project.status);
    setText('detail-location', project.location);
    setText('detail-description', project.description || (isEnglish() ? 'Detailed information will be shared soon.' : 'Detaylı bilgiler yakında paylaşılacaktır.'));

    const imageNode = document.getElementById('detail-image');
    if (imageNode) {
      imageNode.src = assetPath(project.image);
      imageNode.alt = project.title;
    }

    const galleryContainer = document.getElementById('detail-gallery');
    const galleryBox = document.querySelector('.detail-gallery-box');
    if (galleryContainer && galleryBox) {
      const gallery = Array.isArray(project.gallery) ? project.gallery : [];
      if (!gallery.length) {
        galleryBox.style.display = 'none';
      } else {
        galleryBox.style.display = 'block';
        galleryContainer.innerHTML = gallery.map((img, index) => `
          <img src="${assetPath(img)}" alt="${escapeHtml(project.title)} ${index + 1}" loading="lazy" class="fade-up">
        `).join('');
      }
    }
    initScrollAnimations();
  } catch (error) {
    console.error('Project detail could not be loaded:', error);
  }
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value ?? '-';
}
