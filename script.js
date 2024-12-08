// Function to toggle topic dropdown
function toggleTopic(element) {
    // Toggle active class on header
    element.classList.toggle('active');
    
    // Toggle active class on content
    const content = element.nextElementSibling;
    content.classList.toggle('active');
    
    // Rotate chevron icon
    const icon = element.querySelector('i');
    if (content.classList.contains('active')) {
        icon.style.transform = 'rotate(90deg)';
    } else {
        icon.style.transform = 'rotate(0)';
    }
}

// Function to handle smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Auto-expand current section in sidebar based on URL hash
    const hash = window.location.hash;
    if (hash) {
        const targetLink = document.querySelector(`a[href="${hash}"]`);
        if (targetLink) {
            const topicContent = targetLink.closest('.topic-content');
            if (topicContent) {
                const topicHeader = topicContent.previousElementSibling;
                toggleTopic(topicHeader);
            }
        }
    }

    // Highlight current section in sidebar while scrolling
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.topic-content a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
                const topicContent = link.closest('.topic-content');
                if (topicContent && !topicContent.classList.contains('active')) {
                    const topicHeader = topicContent.previousElementSibling;
                    toggleTopic(topicHeader);
                }
            }
        });
    });
});

// Function to handle mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Add mobile menu functionality if screen width is small
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        const navBrand = document.querySelector('.nav-brand');
        if (!document.querySelector('.mobile-menu-btn')) {
            const menuBtn = document.createElement('button');
            menuBtn.classList.add('mobile-menu-btn');
            menuBtn.innerHTML = '☰';
            menuBtn.onclick = toggleMobileMenu;
            navBrand.after(menuBtn);
        }
    } else {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            menuBtn.remove();
        }
        document.querySelector('.nav-links').classList.remove('active');
    }
});
