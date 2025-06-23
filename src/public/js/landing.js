const images = [
  '/images/hero-banner.png',
  '/images/hero2.png',
  '/images/hero3.png',
  '/images/hero4.png'
];

let currentSlide = 0;
const heroImage = document.getElementById('heroImage');
const dots = document.getElementsByClassName('dot');

function showSlide(index) {
  currentSlide = index;
  heroImage.style.opacity = 0;
  setTimeout(() => {
    heroImage.src = images[currentSlide];
    heroImage.style.opacity = 1;
    updateDots();
  }, 300);
}

function updateDots() {
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove('active');
  }
  dots[currentSlide].classList.add('active');
}

function autoSlide() {
  currentSlide = (currentSlide + 1) % images.length;
  showSlide(currentSlide);
}

let slideInterval = setInterval(autoSlide, 3500);

for (let i = 0; i < dots.length; i++) {
  dots[i].onclick = () => {
    clearInterval(slideInterval);
    showSlide(i);
    slideInterval = setInterval(autoSlide, 3500);
  };
}

// Initialize
showSlide(0);