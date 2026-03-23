document.addEventListener('DOMContentLoaded', () => {

    AOS.init({
        duration: 800, 
        easing: 'ease-in-out', 
        once: true, 
        offset: 100 
    });
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if(hamburger) {
        hamburger.addEventListener('click', () => {

            navMenu.classList.toggle('active');
            
            if(navMenu.classList.contains('active')) {
                hamburger.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    if (document.getElementById('project-list')) {
        loadProjects();
    } 

    if (document.getElementById('detail-title')) {
        loadProjectDetail();
    }
    
    if (document.getElementById('project-detail-content')) {
        loadProjectDetails();
    }
});

async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        let projects = await response.json(); 
        const projectList = document.getElementById('project-list');

        const urlParams = new URLSearchParams(window.location.search);
        const statusFilter = urlParams.get('status');
        const categoryFilter = urlParams.get('category'); 

        
        if (statusFilter === 'tamamlandi') {
            projects = projects.filter(p => p.status === 'Tamamlandı');
        } else if (statusFilter === 'devam-ediyor') {
            projects = projects.filter(p => p.status === 'Devam Ediyor');
        }

        if (categoryFilter === 'altyapi') {
            projects = projects.filter(p => p.category.toUpperCase().includes('ALTYAPI'));
        } else if (categoryFilter === 'konut') {
            projects = projects.filter(p => p.category.toUpperCase().includes('KONUT') || p.category.toUpperCase().includes('ÜSTYAPI'));
        } else if (categoryFilter === 'endustriyel') {
            projects = projects.filter(p => p.category.toUpperCase().includes('ENDÜSTRİYEL'));
        }

        projectList.innerHTML = '';

        if (projects.length === 0) {
            projectList.innerHTML = '<h3 style="text-align:center; width:100%; color:#666; padding: 50px 0;">Bu kategoride henüz proje bulunmamaktadır.</h3>';
            return; 
        }

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

async function loadProjectDetails() {
    try {
        
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = parseInt(urlParams.get('id'));

        const response = await fetch('data/projects.json');
        const projects = await response.json();

        const project = projects.find(p => p.id === projectId);

        if (project) {
            
            document.title = `${project.title} | Alila Mühendislik`;
            document.getElementById('detail-title').textContent = project.title;
            document.getElementById('detail-category').textContent = project.category;
            document.getElementById('detail-desc').textContent = project.description;
            document.getElementById('detail-image').src = project.image;
            
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

async function loadProjectDetail() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (!projectId) return; 

        const response = await fetch('data/projects.json');
        const projects = await response.json();

        const project = projects.find(p => p.id == projectId);

        if (project) {
            
            document.getElementById('detail-title').innerText = project.title;
            document.getElementById('detail-image').src = project.image;
            document.getElementById('detail-category').innerText = project.category;
            document.getElementById('detail-status').innerText = project.status;
            document.getElementById('detail-location').innerText = project.location;
            document.getElementById('detail-description').innerText = project.description;
            
            const galleryContainer = document.getElementById('detail-gallery');
            const galleryBox = document.querySelector('.detail-gallery-box');
            
            if (galleryContainer && galleryBox) {
                galleryContainer.innerHTML = ''; 
                
                if (project.gallery && project.gallery.length > 0) {
                    galleryBox.style.display = 'block'; 
                    project.gallery.forEach(imgUrl => {
                
                        galleryContainer.innerHTML += `<img src="${imgUrl}" alt="Proje Detay Görseli" data-aos="fade-up">`;
                    });
                } else {
                    
                    galleryBox.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Proje detayı yüklenirken hata:', error);
    }
}