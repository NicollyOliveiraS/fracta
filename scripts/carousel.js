document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('carouselContainer');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    const dots = document.querySelectorAll('.indicator-dot');
    
    if (!container) return;

    // Atualiza os estilos das bolinhas indicadoras
    function updateDots(activeIndex) {
        dots.forEach((dot, idx) => {
            if (idx === activeIndex) {
                dot.classList.remove('bg-gray-200');
                dot.classList.add('bg-[#C56E33]', 'w-4');
            } else {
                dot.classList.remove('bg-[#C56E33]', 'w-4');
                dot.classList.add('bg-gray-200');
            }
        });
    }

    // Ação do botão "Avançar"
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const width = container.clientWidth;
            if (container.scrollLeft + width >= container.scrollWidth - 10) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: width, behavior: 'smooth' });
            }
        });
    }

    // Ação do botão "Voltar"
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const width = container.clientWidth;
            if (container.scrollLeft <= 0) {
                container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: -width, behavior: 'smooth' });
            }
        });
    }

    // Sincroniza as bolinhas automaticamente ao arrastar ou rolar o carrossel
    container.addEventListener('scroll', () => {
        const index = Math.round(container.scrollLeft / container.clientWidth);
        updateDots(index);
    });

    // Permite clicar direto nas bolinhas para mudar de slide
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideIndex = parseInt(e.target.dataset.slide);
            container.scrollTo({ left: container.clientWidth * slideIndex, behavior: 'smooth' });
        });
    });

    // Rotação automática a cada 7 segundos (opcional)
    setInterval(() => {
        const width = container.clientWidth;
        if (container.scrollLeft + width >= container.scrollWidth - 5) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: width, behavior: 'smooth' });
        }
    }, 7000);
});