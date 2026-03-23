document.addEventListener('DOMContentLoaded', () => {

    // AOS (Animasyon) Kütüphanesini Başlat
    AOS.init({
        duration: 800, // Animasyonun süresi (0.8 saniye)
        easing: 'ease-in-out', // Yumuşak başla, yumuşak bitir
        once: true, // Aşağı kaydırınca çalışsın, yukarı çıkınca tekrarlamasın (Daha kurumsal durur)
        offset: 100 // Eleman ekranda 100px göründüğünde animasyon başlasın
    });
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if(hamburger) {
        hamburger.addEventListener('click', () => {
            // İkona tıklanınca menüye 'active' sınıfını ekle/çıkar
            navMenu.classList.toggle('active');
            
            // Tıklayınca ikon üç çizgiden "X" çarpı işaretine dönsün
            if(navMenu.classList.contains('active')) {
                hamburger.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    // Sayfada "project-list" kutusu varsa (Ana Sayfa veya Projeler sayfası)
    if (document.getElementById('project-list')) {
        loadProjects();
    } 

    if (document.getElementById('detail-title')) {
        loadProjectDetail();
    }
    
    // Sayfada "project-detail-content" kutusu varsa (Detay sayfası)
    if (document.getElementById('project-detail-content')) {
        loadProjectDetails();
    }
});

// --- LİSTELEME VE FİLTRELEME FONKSİYONU ---
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        let projects = await response.json(); 
        const projectList = document.getElementById('project-list');

        // 1. URL'deki gizli şifreleri (parametreleri) yakala
        const urlParams = new URLSearchParams(window.location.search);
        const statusFilter = urlParams.get('status');
        const categoryFilter = urlParams.get('category'); // YENİ: Kategori şifresi

        // 2. Duruma (Tamamlandı/Devam Eden) göre filtrele
        if (statusFilter === 'tamamlandi') {
            projects = projects.filter(p => p.status === 'Tamamlandı');
        } else if (statusFilter === 'devam-ediyor') {
            projects = projects.filter(p => p.status === 'Devam Ediyor');
        }

        // 3. Kategoriye (Faaliyet Alanı) göre filtrele
        // Not: JSON'daki yazım farklılıklarını (Büyük/küçük harf) tolere etmek için toUpperCase kullandık.
        if (categoryFilter === 'altyapi') {
            projects = projects.filter(p => p.category.toUpperCase().includes('ALTYAPI'));
        } else if (categoryFilter === 'konut') {
            projects = projects.filter(p => p.category.toUpperCase().includes('KONUT') || p.category.toUpperCase().includes('ÜSTYAPI'));
        } else if (categoryFilter === 'endustriyel') {
            projects = projects.filter(p => p.category.toUpperCase().includes('ENDÜSTRİYEL'));
        }

        projectList.innerHTML = '';

        // Eğer o kategoride proje yoksa ekrana mesaj yaz
        if (projects.length === 0) {
            projectList.innerHTML = '<h3 style="text-align:center; width:100%; color:#666; padding: 50px 0;">Bu kategoride henüz proje bulunmamaktadır.</h3>';
            return; 
        }

        // 4. Filtrelenmiş projeleri ekrana bas
        projects.forEach(project => {
            const projectCard = `
                <a href="proje-detay.html?id=${project.id}" class="project-card" style="text-decoration: none; color: inherit; display: block;">
                    <div class="status-badge">${project.status}</div>
                    <img src="${project.image}" alt="${project.title}" onerror="this.src='https://placehold.co/600x400?text=Görsel+Yok'">
                    <div class="card-info">
                        <span class="category">${project.category}</span>
                        <h3>${project.title}</h3>
                        <p class="location"><i class="fas fa-map-marker-alt"></i> ${project.location}</p>
                    </div>
                </a>
            `;
            projectList.innerHTML += projectCard;
        });

    } catch (error) {
        console.error('Projeler yüklenirken hata:', error);
    }
}

// --- DETAY SAYFASI FONKSİYONU ---
async function loadProjectDetails() {
    try {
        // 1. URL'deki id'yi al (örn: proje-detay.html?id=1 ise 1'i alır)
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = parseInt(urlParams.get('id'));

        // 2. Veritabanını çek
        const response = await fetch('data/projects.json');
        const projects = await response.json();

        // 3. ID'si eşleşen projeyi bul
        const project = projects.find(p => p.id === projectId);

        if (project) {
            // Bulunan verileri HTML kutularına yerleştir
            document.title = `${project.title} | Alila Mühendislik`;
            document.getElementById('detail-title').textContent = project.title;
            document.getElementById('detail-category').textContent = project.category;
            document.getElementById('detail-desc').textContent = project.description;
            document.getElementById('detail-image').src = project.image;
            
            // Teknik Tabloyu Doldur
            document.getElementById('t-location').textContent = project.location;
            document.getElementById('t-year').textContent = project.year;
            document.getElementById('t-status').textContent = project.status;
        } else {
            document.getElementById('project-detail-content').innerHTML = '<h2 style="text-align:center">Proje bulunamadı.</h2>';
        }

    } catch (error) {
        console.error('Detay yüklenirken hata:', error);
    }
}

// --- PROJE DETAY YÜKLEME FONKSİYONU ---
async function loadProjectDetail() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (!projectId) return; // ID yoksa dur

        const response = await fetch('data/projects.json');
        const projects = await response.json();

        const project = projects.find(p => p.id == projectId);

        if (project) {
            // HTML'deki yerleri JSON'daki gerçek verilerle doldurur
            document.getElementById('detail-title').innerText = project.title;
            document.getElementById('detail-image').src = project.image;
            document.getElementById('detail-category').innerText = project.category;
            document.getElementById('detail-status').innerText = project.status;
            document.getElementById('detail-location').innerText = project.location;
            document.getElementById('detail-description').innerText = project.description;
            // YENİ: Galeri fotoğraflarını ekrana basma
            const galleryContainer = document.getElementById('detail-gallery');
            const galleryBox = document.querySelector('.detail-gallery-box');
            
            if (galleryContainer && galleryBox) {
                galleryContainer.innerHTML = ''; // Önce içini temizle
                
                // Eğer projede ekstra fotoğraf varsa dizecek
                if (project.gallery && project.gallery.length > 0) {
                    galleryBox.style.display = 'block'; // Kutuyu görünür yap
                    project.gallery.forEach(imgUrl => {
                        // Resimler aşağıdan animasyonla gelsin
                        galleryContainer.innerHTML += `<img src="${imgUrl}" alt="Proje Detay Görseli" data-aos="fade-up">`;
                    });
                } else {
                    // Eğer ekstra fotoğraf yoksa galeri kutusunu tamamen gizle ki boş durmasın
                    galleryBox.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Proje detayı yüklenirken hata:', error);
    }
}