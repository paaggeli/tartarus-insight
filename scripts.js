// Responsive menu
const hamburger = document.querySelector('.hamburger');
const closeMenu = document.querySelector('.close-mobile-menu');
const navMenu = document.querySelector('#navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.add('active');
    hamburger.style.display = 'none';
    closeMenu.style.display = 'block';
});

closeMenu.addEventListener('click', () => {
    navMenu.classList.remove('active');
    hamburger.style.display = 'block';
    closeMenu.style.display = 'none';
});