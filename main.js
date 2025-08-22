/**
 * PLS World News - Main JavaScript File
 * Handles core functionality, loading, and initialization
 */

class PLSWorldNews {
    constructor() {
        this.isLoading = true;
        this.currentTheme = localStorage.getItem('theme') || 'auto';
        this.notifications = [];
        this.searchCache = new Map();
        this.observers = new Map();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleDOMContentLoaded = this.handleDOMContentLoaded.bind(this);
        this.handleWindowLoad = this.handleWindowLoad.bind(this);
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.handleDOMContentLoaded);
        } else {
            this.handleDOMContentLoaded();
        }
        
        // Initialize when everything is loaded
        if (document.readyState === 'complete') {
            this.handleWindowLoad();
        } else {
            window.addEventListener('load', this.handleWindowLoad);
        }
    }
    
    /**
     * Handle DOM Content Loaded
     */
    handleDOMContentLoaded() {
        console.log('🚀 PLS World News - DOM Content Loaded');
        this.initializeCore();
        this.initializeComponents();
        this.initializeEventListeners();
    }
    
    /**
     * Handle Window Load (all resources loaded)
     */
    handleWindowLoad() {
        console.log('✅ PLS World News - Window Loaded');
        this.hideLoadingScreen();
        this.initializeLazyLoading();
        this.initializeAnimations();
    }
    
    /**
     * Initialize core functionality
     */
    initializeCore() {
        this.initializeTheme();
        this.initializeServiceWorker();
        this.initializeErrorHandling();
        this.updateDateTime();
        this.initializeWeather();
    }
    
    /**
     * Initialize components
     */
    initializeComponents() {
        this.initializeNavigation();
        this.initializeSearch();
        this.initializeNewsletter();
        this.initializeModals();
        this.initializeTabs();
        this.initializeCarousels();
        this.initializeBackToTop();
    }
    
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Scroll handler
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    this.handleScroll();
                    scrollTimeout = null;
                }, 16); // ~60fps
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Click delegation
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Form submissions
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Online/Offline status
        window.addEventListener('online', () => this.showNotification('Connection restored', 'success'));
        window.addEventListener('offline', () => this.showNotification('You are offline', 'warning'));
    }
    
    /**
     * Hide loading screen with animation
     */
    hideLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            // Add a small delay to ensure everything is ready
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                
                // Remove from DOM after animation
                setTimeout(() => {
                    loadingScreen.remove();
                    this.isLoading = false;
                    
                    // Trigger custom event
                    document.dispatchEvent(new CustomEvent('plsNewsLoaded'));
                    
                    // Initialize features that need the page to be fully visible
                    this.initializePostLoad();
                }, 500);
            }, 300);
        }
    }
    
    /**
     * Initialize features after loading screen is hidden
     */
    initializePostLoad() {
        this.initializeBreakingNews();
        this.initializeAutoRefresh();
        this.initializeAnalytics();
        this.preloadCriticalImages();
    }
    
    /**
     * Initialize theme system
     */
    initializeTheme() {
        const themeToggle = document.querySelector('.dark-mode-toggle');
        const html = document.documentElement;
        
        // Set initial theme
        this.applyTheme(this.currentTheme);
        
        // Theme toggle handler
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                if (this.currentTheme === 'auto') {
                    this.applyTheme('auto');
                }
            });
        }
    }
    
    /**
     * Apply theme
     */
    applyTheme(theme) {
        const html = document.documentElement;
        const themeToggle = document.querySelector('.dark-mode-toggle i');
        
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            if (themeToggle) themeToggle.className = 'fas fa-sun';
        } else if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
            if (themeToggle) themeToggle.className = 'fas fa-moon';
        } else {
            // Auto theme
            html.setAttribute('data-theme', 'auto');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (themeToggle) {
                themeToggle.className = prefersDark ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
    }
    
    /**
     * Toggle theme
     */
    toggleTheme() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        
        this.applyTheme(nextTheme);
        
        // Show notification
        const themeNames = { light: 'Light', dark: 'Dark', auto: 'Auto' };
        this.showNotification(`Switched to ${themeNames[nextTheme]} theme`, 'info');
    }
    
    /**
     * Initialize navigation
     */
    initializeNavigation() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        // Mobile menu toggle
        if (mobileToggle && mainNav) {
            mobileToggle.addEventListener('click', () => {
                const isActive = mobileToggle.classList.contains('active');
                
                if (isActive) {
                    mobileToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                    document.body.style.overflow = '';
                } else {
                    mobileToggle.classList.add('active');
                    mainNav.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
        
        // Close mobile menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 767) {
                    mobileToggle?.classList.remove('active');
                    mainNav?.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Handle dropdown menus on touch devices
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('a');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                toggle.addEventListener('click', (e) => {
                    if (window.innerWidth <= 767) {
                        e.preventDefault();
                        dropdown.classList.toggle('active');
                    }
                });
            }
        });
        
        // Active navigation highlighting
        this.updateActiveNavigation();
    }
    
    /**
     * Update active navigation based on current page
     */
    updateActiveNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
    
    /**
     * Initialize search functionality
     */
    initializeSearch() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.querySelector('.search-form input');
        const searchResults = document.createElement('div');
        
        if (!searchForm || !searchInput) return;
        
        // Create search results container
        searchResults.className = 'search-results';
        searchResults.innerHTML = `
            <div class="search-results-content">
                <div class="search-results-header">
                    <h4>Search Results</h4>
                    <button class="search-close" aria-label="Close search">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-results-body">
                    <div class="search-loading">
                        <div class="loading-spinner"></div>
                        <p>Searching...</p>
                    </div>
                    <div class="search-results-list"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchResults);
        
        // Search input handler
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    this.performSearch(query);
                }, 300);
            } else {
                this.hideSearchResults();
            }
        });
        
        // Search form submission
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                this.performSearch(query, true);
            }
        });
        
        // Close search results
        const searchClose = searchResults.querySelector('.search-close');
        searchClose.addEventListener('click', () => {
            this.hideSearchResults();
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchResults.classList.contains('active')) {
                this.hideSearchResults();
            }
        });
        
        // Close when clicking outside
        searchResults.addEventListener('click', (e) => {
            if (e.target === searchResults) {
                this.hideSearchResults();
            }
        });
    }
    
    /**
     * Perform search
     */
    async performSearch(query, showFullResults = false) {
        const searchResults = document.querySelector('.search-results');
        const searchLoading = searchResults.querySelector('.search-loading');
        const searchResultsList = searchResults.querySelector('.search-results-list');
        
        // Show search results container
        searchResults.classList.add('active');
        searchLoading.style.display = 'block';
        searchResultsList.innerHTML = '';
        
        try {
            // Check cache first
            const cacheKey = query.toLowerCase();
            if (this.searchCache.has(cacheKey)) {
                const cachedResults = this.searchCache.get(cacheKey);
                this.displaySearchResults(cachedResults, query);
                return;
            }
            
            // Simulate API call (replace with actual search endpoint)
            const results = await this.mockSearchAPI(query);
            
            // Cache results
            this.searchCache.set(cacheKey, results);
            
            // Display results
            this.displaySearchResults(results, query);
            
        } catch (error) {
            console.error('Search error:', error);
            searchResultsList.innerHTML = `
                <div class="search-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Search failed. Please try again.</p>
                </div>
            `;
        } finally {
            searchLoading.style.display = 'none';
        }
    }
    
    /**
     * Mock search API (replace with actual implementation)
     */
    async mockSearchAPI(query) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock search results
        const mockResults = [
            {
                id: 1,
                title: `Breaking: ${query} impacts global markets`,
                excerpt: `Latest developments regarding ${query} have significant implications...`,
                category: 'Business',
                date: new Date().toISOString(),
                image: 'assets/images/news/news-1.jpg',
                url: '#'
            },
            {
                id: 2,
                title: `${query} - What you need to know`,
                excerpt: `Comprehensive analysis of ${query} and its effects on...`,
                category: 'World',
                date: new Date(Date.now() - 86400000).toISOString(),
                image: 'assets/images/news/news-2.jpg',
                url: '#'
            },
            {
                id: 3,
                title: `Expert opinion on ${query}`,
                excerpt: `Leading experts weigh in on the ${query} situation...`,
                category: 'Politics',
                date: new Date(Date.now() - 172800000).toISOString(),
                image: 'assets/images/news/news-3.jpg',
                url: '#'
            }
        ];
        
        return mockResults.filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.excerpt.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    /**
     * Display search results
     */
    displaySearchResults(results, query) {
        const searchResultsList = document.querySelector('.search-results-list');
        
        if (results.length === 0) {
            searchResultsList.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <h4>No results found</h4>
                    <p>Try different keywords or check your spelling.</p>
                </div>
            `;
            return;
        }
        
        const resultsHTML = results.map(result => `
            <article class="search-result-item">
                <div class="search-result-image">
                    <img src="${result.image}" alt="${result.title}" loading="lazy">
                    <span class="category-tag ${result.category.toLowerCase()}">${result.category}</span>
                </div>
                <div class="search-result-content">
                    <h4><a href="${result.url}">${this.highlightSearchTerm(result.title, query)}</a></h4>
                    <p>${this.highlightSearchTerm(result.excerpt, query)}</p>
                    <div class="search-result-meta">
                        <span><i class="fas fa-clock"></i> ${this.formatDate(result.date)}</span>
                    </div>
                </div>
            </article>
        `).join('');
        
        searchResultsList.innerHTML = `
            <div class="search-results-header">
                <p>Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"</p>
            </div>
            ${resultsHTML}
            <div class="search-results-footer">
                <a href="/search?q=${encodeURIComponent(query)}" class="view-all-results">
                    View all results <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
    }
    
    /**
     * Highlight search term in text
     */
    highlightSearchTerm(text, term) {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    /**
     * Hide search results
     */
    hideSearchResults() {
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.classList.remove('active');
        }
    }
    
    /**
     * Initialize newsletter functionality
     */
    initializeNewsletter() {
        const newsletterBtns = document.querySelectorAll('.newsletter-btn');
        const newsletterForms = document.querySelectorAll('.newsletter-form, .modal-newsletter-form');
        
        // Newsletter button handlers
        newsletterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showNewsletterModal();
            });
        });
        
        // Newsletter form handlers
        newsletterForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmission(form);
            });
        });
    }
    
    /**
     * Show newsletter modal
     */
    showNewsletterModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on email input
            const emailInput = modal.querySelector('input[type="email"]');
            if (emailInput) {
                setTimeout(() => emailInput.focus(), 100);
            }
        }
    }
    
    /**
     * Handle newsletter submission
     */
    async handleNewsletterSubmission(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput?.value.trim();
        
        if (!email || !this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        
        try {
            // Simulate API call
            await this.mockNewsletterAPI(email);
            
            // Success
            this.showNotification('Successfully subscribed to newsletter!', 'success');
            form.reset();
            this.hideModal();
            
            // Store subscription in localStorage
            localStorage.setItem('newsletter_subscribed', 'true');
            localStorage.setItem('newsletter_email', email);
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showNotification('Subscription failed. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    /**
     * Mock newsletter API
     */
    async mockNewsletterAPI(email) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate random success/failure for demo
        if (Math.random() > 0.1) {
            return { success: true, message: 'Subscribed successfully' };
        } else {
            throw new Error('Subscription failed');
        }
    }
    
    /**
     * Initialize modal functionality
     */
    initializeModals() {
        const modals = document.querySelectorAll('.modal');
        const modalCloses = document.querySelectorAll('.modal-close');
        
        // Close button handlers
        modalCloses.forEach(close => {
            close.addEventListener('click', () => {
                this.hideModal();
            });
        });
        
        // Click outside to close
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }
    
    /**
     * Hide modal
     */
    hideModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    /**
     * Initialize tabs functionality
     */
    initializeTabs() {
        const tabContainers = document.querySelectorAll('.section-tabs');
        
        tabContainers.forEach(container => {
            const tabs = container.querySelectorAll('.tab-btn');
            const contentArea = container.closest('.latest-news')?.querySelector('.news-grid');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    
                    // Load content for the selected tab
                    const category = tab.dataset.category;
                    if (category && contentArea) {
                        this.loadTabContent(category, contentArea);
                    }
                });
            });
        });
    }
    
    /**
     * Load tab content
     */
    async loadTabContent(category, contentArea) {
        // Show loading state
        contentArea.style.opacity = '0.5';
        
        try {
            // Simulate API call
            const articles = await this.mockArticlesAPI(category);
            
            // Update content
            this.renderArticles(articles, contentArea);
            
        } catch (error) {
            console.error('Failed to load tab content:', error);
            this.showNotification('Failed to load content', 'error');
        } finally {
            contentArea.style.opacity = '1';
        }
    }
    
    /**
     * Mock articles API
     */
    async mockArticlesAPI(category) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Return mock articles based on category
        const mockArticles = [
            {
                id: 1,
                title: `Latest ${category} News Update`,
                excerpt: 'This is a sample article excerpt for the selected category...',
                image: 'assets/images/news/news-1.jpg',
                category: category,
                date: new Date().toISOString(),
                author: 'John Doe',
                readTime: '5 min read'
            },
            {
                id: 2,
                title: `Breaking ${category} Development`,
                excerpt: 'Another sample article with relevant information...',
                image: 'assets/images/news/news-2.jpg',
                category: category,
                date: new Date(Date.now() - 86400000).toISOString(),
                author: 'Jane Smith',
                readTime: '3 min read'
            }
        ];
        
        return mockArticles;
    }
    
    /**
     * Render articles in content area
     */
    renderArticles(articles, contentArea) {
        const articlesHTML = articles.map(article => `
            <article class="news-card fade-in">
                <div class="news-image">
                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                    <span class="category-tag ${article.category.toLowerCase()}">${article.category}</span>
                </div>
                <div class="news-content">
                    <h3><a href="/article/${article.id}">${article.title}</a></h3>
                    <p>${article.excerpt}</p>
                    <div class="news-meta">
                        <div class="author">
                            <img src="assets/images/authors/author-1.jpg" alt="${article.author}">
                            <span>${article.author}</span>
                        </div>
                        <span><i class="fas fa-clock"></i> ${this.formatDate(article.date)}</span>
                    </div>
                </div>
            </article>
        `).join('');
        
        contentArea.innerHTML = articlesHTML;
    }
    
    /**
     * Initialize back to top button
     */
    initializeBackToTop() {
        const backToTop = document.querySelector('.back-to-top');
        
        if (backToTop) {
            backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
    
    /**
     * Initialize breaking news ticker
     */
    initializeBreakingNews() {
        const ticker = document.querySelector('.ticker-text');
        if (!ticker) return;
        
        // Pause animation on hover
        ticker.addEventListener('mouseenter', () => {
            ticker.style.animationPlayState = 'paused';
        });
        
        ticker.addEventListener('mouseleave', () => {
            ticker.style.animationPlayState = 'running';
        });
        
        // Load breaking news from API
        this.loadBreakingNews();
    }
    
    /**
     * Load breaking news
     */
    async loadBreakingNews() {
        try {
            // Mock breaking news API
            const breakingNews = await this.mockBreakingNewsAPI();
            const ticker = document.querySelector('.ticker-text');
            
            if (ticker && breakingNews.length > 0) {
                const newsHTML = breakingNews.map(news => 
                    `<span>${news.title}</span>`
                ).join('');
                
                ticker.innerHTML = newsHTML;
            }
        } catch (error) {
            console.error('Failed to load breaking news:', error);
        }
    }
    
    /**
     * Mock breaking news API
     */
    async mockBreakingNewsAPI() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            { id: 1, title: 'Global markets surge following economic announcement' },
            { id: 2, title: 'Technology breakthrough promises revolutionary changes' },
            { id: 3, title: 'International summit reaches historic agreement' },
            { id: 4, title: 'Climate initiative gains worldwide support' }
        ];
    }
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const backToTop = document.querySelector('.back-to-top');
        
        // Show/hide back to top button
        if (backToTop) {
            if (scrollTop > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
        
        // Update reading progress (if on article page)
        this.updateReadingProgress();
        
        // Lazy load images
        this.lazyLoadImages();
    }
    
    /**
     * Handle resize events
     */
    handleResize() {
        // Close mobile menu on resize
        if (window.innerWidth > 767) {
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            const mainNav = document.querySelector('.main-nav');
            
            if (mobileToggle?.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                mainNav?.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
        
        // Recalculate layouts if needed
        this.recalculateLayouts();
    }
    
    /**
     * Handle global clicks
     */
    handleGlobalClick(e) {
        // Handle load more buttons
        if (e.target.matches('.load-more-btn')) {
            e.preventDefault();
            this.handleLoadMore(e.target);
        }
        
        // Handle article links
        if (e.target.matches('.news-card a, .hero-card a')) {
            this.trackArticleClick(e.target);
        }
        
        // Handle social sharing
        if (e.target.matches('.share-btn')) {
            e.preventDefault();
            this.handleSocialShare(e.target);
        }
    }
    
    /**
     * Handle form submissions
     */
    handleFormSubmit(e) {
        const form = e.target;
        
        // Newsletter forms
        if (form.matches('.newsletter-form, .modal-newsletter-form')) {
            e.preventDefault();
            this.handleNewsletterSubmission(form);
        }
        
        // Contact forms
        if (form.matches('.contact-form')) {
            e.preventDefault();
            this.handleContactSubmission(form);
        }
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeydown(e) {
        // Escape key handlers
        if (e.key === 'Escape') {
            this.hideModal();
            this.hideSearchResults();
        }
        
        // Search shortcut (Ctrl/Cmd + K)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-form input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const container = this.getNotificationContainer();
        const notification = document.createElement('div');
        const id = Date.now();
        
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas ${this.getNotificationIcon(type)}"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-message">${message}</div>
                </div>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        // Store notification
        this.notifications.push({ id, element: notification, type, message });
        
        return id;
    }
    
    /**
     * Get notification container
     */
    getNotificationContainer() {
        let container = document.querySelector('.notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        return container;
    }
    
    /**
     * Get notification icon
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check',
            error: 'fa-times',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    /**
     * Remove notification
     */
    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }
    
    /**
     * Initialize lazy loading
     */
    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            // Observe all images with data-src
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
            
            this.observers.set('images', imageObserver);
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }
    
    /**
     * Load image
     */
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        const imageLoader = new Image();
        imageLoader.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        };
        imageLoader.onerror = () => {
            img.src = 'assets/images/placeholder.jpg';
            img.classList.add('error');
        };
        imageLoader.src = src;
    }
    
    /**
     * Load all images (fallback)
     */
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }
    
    /**
     * Initialize animations
     */
    initializeAnimations() {
        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            // Observe elements with animation classes
            const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .scale-in');
            animatedElements.forEach(el => animationObserver.observe(el));
            
            this.observers.set('animations', animationObserver);
        }
    }
    
    /**
     * Initialize weather widget
     */
    async initializeWeather() {
        const weatherWidget = document.querySelector('.weather-widget');
        if (!weatherWidget) return;
        
        try {
            const weatherData = await this.getWeatherData();
            this.updateWeatherWidget(weatherData);
        } catch (error) {
            console.error('Weather data failed to load:', error);
            weatherWidget.style.display = 'none';
        }
    }
    
    /**
     * Get weather data
     */
    async getWeatherData() {
        // Mock weather API (replace with actual weather service)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            location: 'New York, NY',
            temperature: 22,
            condition: 'sunny',
            humidity: 65,
            windSpeed: 12,
            icon: 'fas fa-sun'
        };
    }
    
    /**
     * Update weather widget
     */
    updateWeatherWidget(data) {
        const widget = document.querySelector('.weather-widget');
        if (!widget) return;
        
        widget.innerHTML = `
            <h4 class="widget-title">
                <i class="fas fa-cloud-sun"></i>
                Weather
            </h4>
            <div class="weather-current">
                <div class="weather-icon">
                    <i class="${data.icon}"></i>
                </div>
                <div class="weather-temp">${data.temperature}°C</div>
            </div>
            <div class="weather-location">${data.location}</div>
            <div class="weather-details">
                <div class="weather-detail">
                    <i class="fas fa-tint"></i>
                    <span>Humidity: ${data.humidity}%</span>
                </div>
                <div class="weather-detail">
                    <i class="fas fa-wind"></i>
                    <span>Wind: ${data.windSpeed} km/h</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Update date and time
     */
    updateDateTime() {
        const dateElement = document.querySelector('.current-date');
        if (!dateElement) return;
        
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        dateElement.textContent = now.toLocaleDateString('en-US', options);
        
        // Update every minute
        setTimeout(() => this.updateDateTime(), 60000);
    }
    
    /**
     * Initialize auto-refresh
     */
    initializeAutoRefresh() {
        // Refresh breaking news every 5 minutes
        setInterval(() => {
            this.loadBreakingNews();
        }, 5 * 60 * 1000);
        
        // Refresh weather every 30 minutes
        setInterval(() => {
            this.initializeWeather();
        }, 30 * 60 * 1000);
    }
    
    /**
     * Initialize service worker
     */
    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
    
    /**
     * Initialize error handling
     */
    initializeErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.logError('JavaScript Error', e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.logError('Promise Rejection', e.reason);
        });
    }
    
    /**
     * Log error
     */
    logError(type, error) {
        // In production, send to error tracking service
        const errorData = {
            type,
            message: error.message || error,
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        // Store locally for now
        const errors = JSON.parse(localStorage.getItem('pls_errors') || '[]');
        errors.push(errorData);
        
        // Keep only last 10 errors
        if (errors.length > 10) {
            errors.splice(0, errors.length - 10);
        }
        
        localStorage.setItem('pls_errors', JSON.stringify(errors));
    }
    
    /**
     * Handle load more functionality
     */
    async handleLoadMore(button) {
        const container = button.closest('.news-section, .category-section');
        const grid = container?.querySelector('.news-grid, .category-list');
        
        if (!grid) return;
        
        // Show loading state
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        try {
            // Get current page from button data
            const currentPage = parseInt(button.dataset.page || '1');
            const category = button.dataset.category || 'all';
            
            // Load more articles
            const articles = await this.loadMoreArticles(category, currentPage + 1);
            
            if (articles.length > 0) {
                // Append new articles
                const articlesHTML = articles.map(article => this.renderArticleCard(article)).join('');
                grid.insertAdjacentHTML('beforeend', articlesHTML);
                
                // Update page number
                button.dataset.page = currentPage + 1;
                
                // Initialize lazy loading for new images
                this.initializeLazyLoading();
                
                // Show success message
                this.showNotification(`Loaded ${articles.length} more articles`, 'success', 2000);
            } else {
                // No more articles
                button.style.display = 'none';
                this.showNotification('No more articles to load', 'info', 3000);
            }
            
        } catch (error) {
            console.error('Load more failed:', error);
            this.showNotification('Failed to load more articles', 'error');
        } finally {
            // Reset button
            button.disabled = false;
            button.innerHTML = 'Load More <i class="fas fa-arrow-down"></i>';
        }
    }
    
    /**
     * Load more articles
     */
    async loadMoreArticles(category, page) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock API response
        if (page > 3) return []; // Simulate no more articles
        
        return [
            {
                id: Date.now() + Math.random(),
                title: `Additional ${category} Article ${page}`,
                excerpt: 'This is a dynamically loaded article excerpt...',
                image: `assets/images/news/news-${(page % 6) + 1}.jpg`,
                category: category,
                date: new Date().toISOString(),
                author: 'Dynamic Author',
                readTime: '4 min read'
            },
            {
                id: Date.now() + Math.random() + 1,
                title: `Another ${category} Story ${page}`,
                excerpt: 'Another dynamically loaded article with interesting content...',
                image: `assets/images/news/news-${((page + 1) % 6) + 1}.jpg`,
                category: category,
                date: new Date(Date.now() - 3600000).toISOString(),
                author: 'Another Author',
                readTime: '6 min read'
            }
        ];
    }
    
    /**
     * Render article card
     */
    renderArticleCard(article) {
        return `
            <article class="news-card fade-in">
                <div class="news-image">
                    <img data-src="${article.image}" alt="${article.title}" loading="lazy">
                    <span class="category-tag ${article.category.toLowerCase()}">${article.category}</span>
                </div>
                <div class="news-content">
                    <h3><a href="/article/${article.id}">${article.title}</a></h3>
                    <p>${article.excerpt}</p>
                    <div class="news-meta">
                        <div class="author">
                            <img src="assets/images/authors/author-1.jpg" alt="${article.author}">
                            <span>${article.author}</span>
                        </div>
                        <span><i class="fas fa-clock"></i> ${this.formatDate(article.date)}</span>
                    </div>
                </div>
            </article>
        `;
    }
    
    /**
     * Handle social sharing
     */
    handleSocialShare(button) {
        const platform = button.dataset.platform;
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const text = encodeURIComponent('Check out this article from PLS World News');
        
        let shareUrl = '';
        
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${title}%20${url}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
                break;
            default:
                // Native Web Share API
                if (navigator.share) {
                    navigator.share({
                        title: document.title,
                        text: text,
                        url: window.location.href
                    }).catch(err => console.log('Error sharing:', err));
                    return;
                }
        }
        
        if (shareUrl) {
            window.open(shareUrl, 'share', 'width=600,height=400,scrollbars=yes,resizable=yes');
        }
    }
    
    /**
     * Track article click
     */
    trackArticleClick(link) {
        const article = link.closest('.news-card, .hero-card');
        if (!article) return;
        
        const articleData = {
            title: link.textContent.trim(),
            url: link.href,
            category: article.querySelector('.category-tag')?.textContent,
            timestamp: new Date().toISOString()
        };
        
        // Store click data
        const clicks = JSON.parse(localStorage.getItem('pls_article_clicks') || '[]');
        clicks.push(articleData);
        
        // Keep only last 50 clicks
        if (clicks.length > 50) {
            clicks.splice(0, clicks.length - 50);
        }
        
        localStorage.setItem('pls_article_clicks', JSON.stringify(clicks));
        
        // In production, send to analytics service
        console.log('Article clicked:', articleData);
    }
    
    /**
     * Initialize analytics
     */
    initializeAnalytics() {
        // Track page view
        this.trackPageView();
        
        // Track user engagement
        this.trackUserEngagement();
        
        // Track performance metrics
        this.trackPerformanceMetrics();
    }
    
    /**
     * Track page view
     */
    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        // Store page view
        const pageViews = JSON.parse(localStorage.getItem('pls_page_views') || '[]');
        pageViews.push(pageData);
        
        // Keep only last 20 page views
        if (pageViews.length > 20) {
            pageViews.splice(0, pageViews.length - 20);
        }
        
        localStorage.setItem('pls_page_views', JSON.stringify(pageViews));
    }
    
    /**
     * Track user engagement
     */
    trackUserEngagement() {
        let startTime = Date.now();
        let isActive = true;
        
        // Track time on page
        const trackTimeOnPage = () => {
            if (isActive) {
                const timeSpent = Date.now() - startTime;
                localStorage.setItem('pls_time_on_page', timeSpent.toString());
            }
        };
        
        // Track when user becomes inactive
        const handleVisibilityChange = () => {
            if (document.hidden) {
                isActive = false;
                trackTimeOnPage();
            } else {
                isActive = true;
                startTime = Date.now();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', trackTimeOnPage);
        
        // Track scroll depth
        let maxScrollDepth = 0;
        const trackScrollDepth = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);
            
            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
                localStorage.setItem('pls_scroll_depth', maxScrollDepth.toString());
            }
        };
        
        window.addEventListener('scroll', trackScrollDepth);
    }
    
    /**
     * Track performance metrics
     */
    trackPerformanceMetrics() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const metrics = {
                        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
                        timestamp: new Date().toISOString()
                    };
                    
                    localStorage.setItem('pls_performance', JSON.stringify(metrics));
                }, 0);
            });
        }
    }
    
    /**
     * Preload critical images
     */
    preloadCriticalImages() {
        const criticalImages = [
            'assets/images/hero/hero-1.jpg',
            'assets/images/hero/hero-2.jpg',
            'assets/images/hero/hero-3.jpg'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    /**
     * Update reading progress (for article pages)
     */
    updateReadingProgress() {
        const progressBar = document.querySelector('.reading-progress');
        if (!progressBar) return;
        
        const article = document.querySelector('article.article-content');
        if (!article) return;
        
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        
        const progress = Math.min(
            Math.max((scrollTop - articleTop + windowHeight) / articleHeight, 0),
            1
        );
        
        progressBar.style.width = `${progress * 100}%`;
    }
    
    /**
     * Recalculate layouts
     */
    recalculateLayouts() {
        // Recalculate masonry layouts if any
        const masonryContainers = document.querySelectorAll('.masonry');
        masonryContainers.forEach(container => {
            // Trigger layout recalculation
            container.style.height = 'auto';
        });
    }
    
    /**
     * Utility: Validate email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Utility: Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }
    
    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Utility: Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('load', this.handleWindowLoad);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('click', this.handleGlobalClick);
        document.removeEventListener('submit', this.handleFormSubmit);
        
        // Disconnect observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Clear intervals and timeouts
        // (In a real app, you'd track these and clear them)
        
        console.log('🧹 PLS World News - Cleaned up');
    }
}

// Initialize the application
const plsWorldNews = new PLSWorldNews();

// Make it globally accessible for debugging
window.PLSWorldNews = plsWorldNews;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PLSWorldNews;
}

