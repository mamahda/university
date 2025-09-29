export default function Tourist() {
  return /*html*/ `
    <div class="tourist">
      <div class="hero-slides">
        <div class="hero-slide" style="background-image: url('/quiz1/assets/ngebel.jpeg');" data-index="0">
          <div class="hero-content">
            <h2>Telaga Ngebel</h2>
            <p>Nikmati keindahan tenang Telaga Ngebel dengan airnya yang jernih.</p>
          </div>
        </div>
        <div class="hero-slide" style="background-image: url('/quiz1/assets/cumbri.jpg');" data-index="1">
          <div class="hero-content">
            <h2>Bukit Cumbri</h2>
            <p>Jelajahi perbukitan hijau dan pemandangan panorama di Bukit Cumbri.</p>
          </div>
        </div>
        <div class="hero-slide" style="background-image: url('/quiz1/assets/alunalun.jpeg');" data-index="2">
          <div class="hero-content">
            <h2>Alun-Alun Ponorogo</h2>
            <p>Bersantai di alun-alun pusat dan nikmati suasana khas lokal.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initTourist() {
  const slidesContainer = document.querySelector('.hero-slides');
  const slides = document.querySelectorAll('.hero-slide');
  const total = slides.length;
  let current = 0;

  function showSlide(index) {
    current = index;
    slidesContainer.style.transform = `translateX(-${current * 100}vw)`;
  }

  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      let nextIndex = (current + 1) % total;
      showSlide(nextIndex);
    });

    const textDiv = slide.querySelector('.hero-content');
    if (textDiv) {
      textDiv.addEventListener('click', (e) => {
        e.stopPropagation(); // hentikan event bubbling
      });
    }
  });

  showSlide(current);
}
