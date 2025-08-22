/**
 * PLS World News - Carousel Component
 * Handles image carousels and sliders
 */

class PLSCarousel {
    constructor(element, options = {}) {
        this.carousel = element;
        this.options = {
            autoplay: true,
            autoplayDelay: 5000,
            loop: true,
            showDots: true,
            showArrows: true,
            swipe: true,
            fadeEffect: false,
            pauseOnHover: true,
            ...options
        };
        
        this.currentSlide = 0;
        this.slides = [];
        this.isPlaying = this.options.autoplay;
        this.autoplayTimer = null;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        if (!this.carousel) return;
        
        this.setupCarousel();
        this.createControls();
        this.bindEvents();
        
        if (this.options.autoplay) {
            this.startAutoplay();
        }
        
        // Initialize first slide
        this.goToSlide(0, false);
    }
    
    setupCarousel() {
        this.carousel.classList.add('pls-carousel');
        
        // Get slides
        this.slides = Array.from(this.carousel.children);
        
        if (this.slides.length === 0) return;
        
        // Create carousel structure
        const carouselInner = document.createElement('div');
        carouselInner.className = 'carousel-inner';
        
        // Move slides to inner container
        this.slides.forEach((slide, index) => {
            slide.classList.add('carousel-slide');
            slide.dataset.slideIndex = index;
            carouselInner.appendChild(slide);
        });
        
        this.carousel.appendChild(carouselInner);
        this.carouselInner = carouselInner;
        
        // Add fade effect class if enabled
        if (this.options.fadeEffect) {
            this.carousel.classList.add('fade-effect');
        }
    }
    
    createControls() {
        if (this.slides.length <= 1) return;
        
        // Create arrows
        if (this.options.showArrows) {
            this.createArrows();
        }
        
        // Create dots
        if (this.options.showDots) {
            this.createDots();
        }
        
        // Create play/pause button
        this.createPlayPauseButton();
    }
    
    createArrows() {
        const prevArrow = document.createElement('button');
        prevArrow.className = 'carousel-arrow carousel-prev';
        prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevArrow.setAttribute('aria-label', 'Previous slide');
        
        const nextArrow = document.createElement('button');
        nextArrow.className = 'carousel-arrow carousel-next';
        nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextArrow.setAttribute('aria-label', 'Next slide');
        
        this.carousel.appendChild(prevArrow);
        this.carousel.appendChild(nextArrow);
        
        this.prevArrow = prevArrow;
        this.nextArrow = nextArrow;
    }
    
    createDots() {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';
        
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.dataset.slideIndex = index;
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dotsContainer.appendChild(dot);
        });
        
        this.carousel.appendChild(dotsContainer);
        this.dots = Array.from(dotsContainer.children);
    }
    
    createPlayPauseButton() {
        if (!this.options.autoplay) return;
        
        const playPauseBtn = document.createElement('button');
        playPauseBtn.className = 'carousel-play-pause';
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playPauseBtn.setAttribute('aria-label', 'Pause slideshow');
        
        this.carousel.appendChild(playPauseBtn);
        this.playPauseBtn = playPauseBtn;
    }
    
    bindEvents() {
        // Arrow clicks
        if (this.prevArrow) {
            this.prevArrow.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextArrow) {
            this.nextArrow.addEventListener('click', () => this.nextSlide());
        }
        
        // Dot clicks
        if (this.dots) {
            this.dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const slideIndex = parseInt(dot.dataset.slideIndex);
                    this.goToSlide(slideIndex);
                });
            });
        }
        
        // Play/pause button
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => {
                this.toggleAutoplay();
            });
        }
        
        // Keyboard navigation
        this.carousel.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoplay();
                    break;
            }
        });
        
        // Pause on hover
        if (this.options.pauseOnHover) {
            this.carousel.addEventListener('mouseenter', () => {
                this.pauseAutoplay();
            });
            
            this.carousel.addEventListener('mouseleave', () => {
                if (this.isPlaying) {
                    this.startAutoplay();
                }
            });
        }
        
        // Touch/swipe support
        if (this.options.swipe) {
            this.bindSwipeEvents();
        }
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else if (this.isPlaying) {
                this.startAutoplay();
            }
        });
    }
    
    bindSwipeEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        let isDragging = false;
        
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            isDragging = true;
            this.pauseAutoplay();
        };
        
        const handleTouchMove = (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            endX = touch.clientX;
            endY = touch.clientY;
            
            // Prevent vertical scrolling if horizontal swipe detected
            const deltaX = Math.abs(endX - startX);
            const deltaY = Math.abs(endY - startY);
            
            if (deltaX > deltaY) {
                e.preventDefault();
            }
        };
        
        const handleTouchEnd = () => {
            if (!isDragging) return;
            
            isDragging = false;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 50;
            
            // Check if it's a horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
            }
            
            if (this.isPlaying) {
                this.startAutoplay();
            }
        };
        
        this.carousel.addEventListener('touchstart', handleTouchStart, { passive: false });
        this.carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
        this.carousel.addEventListener('touchend', handleTouchEnd);
        
        // Mouse events for desktop
        let isMouseDown = false;
        
        this.carousel.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
            isMouseDown = true;
            this.carousel.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        this.carousel.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            
            endX = e.clientX;
            endY = e.clientY;
        });
        
        this.carousel.addEventListener('mouseup', () => {
            if (!isMouseDown) return;
            
            isMouseDown = false;
            this.carousel.style.cursor = '';
            
            const deltaX = endX - startX;
            const minSwipeDistance = 50;
            
            if (Math.abs(deltaX) > minSwipeDistance) {
                                if (deltaX > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
            }
        });
        
        this.carousel.addEventListener('mouseleave', () => {
            isMouseDown = false;
            this.carousel.style.cursor = '';
        });
    }
    
    goToSlide(index, animate = true) {
        if (this.isTransitioning || index === this.currentSlide) return;
        
        const slideCount = this.slides.length;
        
        // Handle looping
        if (index >= slideCount) {
            index = this.options.loop ? 0 : slideCount - 1;
        } else if (index < 0) {
            index = this.options.loop ? slideCount - 1 : 0;
        }
        
        if (!animate) {
            this.setSlide(index);
            return;
        }
        
        this.isTransitioning = true;
        
        // Trigger slide change event
        this.carousel.dispatchEvent(new CustomEvent('slideChange', {
            detail: {
                from: this.currentSlide,
                to: index,
                carousel: this
            }
        }));
        
        if (this.options.fadeEffect) {
            this.fadeToSlide(index);
        } else {
            this.slideToSlide(index);
        }
    }
    
    setSlide(index) {
        // Remove active class from all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        
        // Add active class to current slide
        this.slides[index].classList.add('active');
        
        // Update dots
        if (this.dots) {
            this.dots.forEach(dot => dot.classList.remove('active'));
            this.dots[index].classList.add('active');
        }
        
        // Update current slide
        this.currentSlide = index;
        
        // Update transform for non-fade effect
        if (!this.options.fadeEffect) {
            const translateX = -index * 100;
            this.carouselInner.style.transform = `translateX(${translateX}%)`;
        }
        
        this.isTransitioning = false;
    }
    
    fadeToSlide(index) {
        const currentSlide = this.slides[this.currentSlide];
        const nextSlide = this.slides[index];
        
        // Set up next slide
        nextSlide.style.opacity = '0';
        nextSlide.classList.add('active');
        
        // Fade out current slide and fade in next slide
        currentSlide.style.transition = 'opacity 0.5s ease-in-out';
        nextSlide.style.transition = 'opacity 0.5s ease-in-out';
        
        // Start fade
        requestAnimationFrame(() => {
            currentSlide.style.opacity = '0';
            nextSlide.style.opacity = '1';
        });
        
        // Clean up after transition
        setTimeout(() => {
            currentSlide.classList.remove('active');
            currentSlide.style.opacity = '';
            currentSlide.style.transition = '';
            nextSlide.style.opacity = '';
            nextSlide.style.transition = '';
            
            this.updateSlideState(index);
        }, 500);
    }
    
    slideToSlide(index) {
        const translateX = -index * 100;
        
        this.carouselInner.style.transition = 'transform 0.5s ease-in-out';
        this.carouselInner.style.transform = `translateX(${translateX}%)`;
        
        // Clean up after transition
        setTimeout(() => {
            this.carouselInner.style.transition = '';
            this.updateSlideState(index);
        }, 500);
    }
    
    updateSlideState(index) {
        // Remove active class from all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        
        // Add active class to current slide
        this.slides[index].classList.add('active');
        
        // Update dots
        if (this.dots) {
            this.dots.forEach(dot => dot.classList.remove('active'));
            this.dots[index].classList.add('active');
        }
        
        this.currentSlide = index;
        this.isTransitioning = false;
        
        // Trigger slide changed event
        this.carousel.dispatchEvent(new CustomEvent('slideChanged', {
            detail: {
                currentSlide: index,
                carousel: this
            }
        }));
    }
    
    nextSlide() {
        const nextIndex = this.currentSlide + 1;
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }
    
    startAutoplay() {
        if (!this.options.autoplay || this.slides.length <= 1) return;
        
        this.pauseAutoplay();
        
        this.autoplayTimer = setInterval(() => {
            this.nextSlide();
        }, this.options.autoplayDelay);
        
        this.isPlaying = true;
        
        if (this.playPauseBtn) {
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.playPauseBtn.setAttribute('aria-label', 'Pause slideshow');
        }
    }
    
    pauseAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
        
        if (this.playPauseBtn) {
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.playPauseBtn.setAttribute('aria-label', 'Play slideshow');
        }
    }
    
    toggleAutoplay() {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.pauseAutoplay();
        } else {
            this.isPlaying = true;
            this.startAutoplay();
        }
    }
    
    destroy() {
        this.pauseAutoplay();
        
        // Remove event listeners
        if (this.prevArrow) {
            this.prevArrow.removeEventListener('click', this.prevSlide);
        }
        
        if (this.nextArrow) {
            this.nextArrow.removeEventListener('click', this.nextSlide);
        }
        
        if (this.dots) {
            this.dots.forEach(dot => {
                dot.removeEventListener('click', this.goToSlide);
            });
        }
        
        // Remove controls
        const controls = this.carousel.querySelectorAll('.carousel-arrow, .carousel-dots, .carousel-play-pause');
        controls.forEach(control => control.remove());
        
        // Reset carousel structure
        this.carousel.classList.remove('pls-carousel', 'fade-effect');
        
        if (this.carouselInner) {
            // Move slides back to carousel
            this.slides.forEach(slide => {
                slide.classList.remove('carousel-slide', 'active');
                delete slide.dataset.slideIndex;
                this.carousel.appendChild(slide);
            });
            
            this.carouselInner.remove();
        }
    }
}

// Auto-initialize carousels
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('[data-carousel]');
    
    carousels.forEach(carousel => {
        const options = {
            autoplay: carousel.dataset.autoplay !== 'false',
            autoplayDelay: parseInt(carousel.dataset.autoplayDelay) || 5000,
            loop: carousel.dataset.loop !== 'false',
            showDots: carousel.dataset.showDots !== 'false',
            showArrows: carousel.dataset.showArrows !== 'false',
            swipe: carousel.dataset.swipe !== 'false',
            fadeEffect: carousel.dataset.fadeEffect === 'true',
            pauseOnHover: carousel.dataset.pauseOnHover !== 'false'
        };
        
        new PLSCarousel(carousel, options);
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PLSCarousel;
}
