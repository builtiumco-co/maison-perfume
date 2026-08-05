document.addEventListener('DOMContentLoaded', () => {
  console.log('Palms Footwear Store initialized. 🌴');

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Intersection Observer for scroll animations
  const fadeElements = document.querySelectorAll('.animate-fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => observer.observe(el));
});

// Mocking the Cart
const cart = {
  items: [],
  addItem(product) {
    this.items.push(product);
    this.updateUI();
  },
  updateUI() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.textContent = `Bag (${this.items.length})`;
    }
  }
};
