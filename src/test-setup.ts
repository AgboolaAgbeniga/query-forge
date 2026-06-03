import '@testing-library/jest-dom';

// Mock requestAnimationFrame for Framer Motion / GSAP / React
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
}
