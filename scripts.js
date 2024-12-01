// Responsive menu
const hamburger = document.querySelector('.hamburger');
const closeMenu = document.querySelector('.close-mobile-menu');
const navMenu = document.querySelector('#navMenu');
const navLinks = document.querySelectorAll('#navMenu ul li a');

hamburger.addEventListener('click', () => {
    navMenu.classList.add('active');
    hamburger.style.display = 'none';
    closeMenu.style.display = 'block';
});

closeMenu.addEventListener('click', () => {
    closeNavMenu();
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeNavMenu();
    });
});

function closeNavMenu() {
    navMenu.classList.remove('active');
    hamburger.style.display = 'block';
    closeMenu.style.display = 'none';
}