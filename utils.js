/**
 * PLS World News - Utility Functions
 * Common utility functions used throughout the application
 */

const PLSUtils = {
    
    /**
     * DOM Utilities
     */
    dom: {
        /**
         * Query selector with error handling
         */
        $(selector, context = document) {
            try {
                return context.querySelector(selector);
            } catch (error) {
                console.error('Invalid selector:', selector, error);
                return null;
            }
        },
        
        /**
         * Query selector all with error handling
         */
        $$(selector, context = document) {
            try {
                return Array.from(context.querySelectorAll(selector));
            } catch (error) {
                console.error('Invalid selector:', selector, error);
                return [];
            }
        },
        
        /**
         * Create element with attributes and content
         */
        createElement(tag, attributes = {}, content = '') {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'dataset') {
                    Object.entries(value).forEach(([dataKey, dataValue]) => {
                        element.dataset[dataKey] = dataValue;
                    });
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            if (content) {
                if (typeof content === 'string') {
                    element.innerHTML = content;
                } else {
                    element.appendChild(content);
                }
            }
            
            return element;
        },
        
        /**
         * Check if element is in viewport
         */
        isInViewport(element, threshold = 0) {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            return (
                rect.top >= -threshold &&
                rect.left >= -threshold &&
                rect.bottom <= windowHeight + threshold &&
                rect.right <= windowWidth + threshold
            );
        },
        
        /**
         * Get element offset from document top
         */
        getOffset(element) {
            let top = 0;
            let left = 0;
            
            while (element) {
                top += element.offsetTop;
                left += element.offsetLeft;
                element = element.offsetParent;
            }
            
            return { top, left };
        },
        
        /**
         * Smooth scroll to element
         */
        scrollToElement(element, offset = 0, duration = 500) {
            const targetPosition = this.getOffset(element).top - offset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;
            
            const animation = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            };
            
            requestAnimationFrame(animation);
        },
        
        /**
         * Easing function for smooth animations
         */
        easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
    },
    
    /**
     * String Utilities
     */
    string: {
        /**
         * Capitalize first letter
         */
        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        
        /**
         * Convert to title case
         */
        toTitleCase(str) {
            return str.replace(/\w\S*/g, (txt) => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        },
        
        /**
         * Truncate string with ellipsis
         */
        truncate(str, length, suffix = '...') {
            if (str.length <= length) return str;
            return str.substring(0, length) + suffix;
        },
        
        /**
         * Remove HTML tags
         */
        stripHtml(str) {
            const div = document.createElement('div');
            div.innerHTML = str;
            return div.textContent || div.innerText || '';
        },
        
        /**
         * Escape HTML characters
         */
        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },
        
        /**
         * Generate slug from string
         */
        slugify(str) {
            return str
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        },
        
        /**
         * Generate random string
         */
        randomString(length = 10) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }
    },
    
    /**
     * Date Utilities
     */
    date: {
        /**
         * Format date to readable string
         */
        format(date, format = 'default') {
            const d = new Date(date);
            
            const formats = {
                default: d.toLocaleDateString(),
                long: d.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                short: d.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                time: d.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                datetime: d.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                iso: d.toISOString()
            };
            
            return formats[format] || formats.default;
        },
        
        /**
         * Get relative time (e.g., "2 hours ago")
         */
        getRelativeTime(date) {
            const now = new Date();
            const past = new Date(date);
            const diffTime = Math.abs(now - past);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.ceil(diffTime / (1000 * 60));
            
            if (diffMinutes < 60) {
                return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
            } else if (diffHours < 24) {
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            } else if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            } else {
                return this.format(date, 'short');
            }
        },
        
        /**
         * Check if date is today
         */
        isToday(date) {
            const today = new Date();
            const checkDate = new Date(date);
            
            return today.toDateString() === checkDate.toDateString();
        },
        
        /**
         * Add days to date
         */
        addDays(date, days) {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }
    },
    
    /**
     * Validation Utilities
     */
    validate: {
        /**
         * Validate email address
         */
        email(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },
        
        /**
         * Validate URL
         */
        url(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
        
        /**
         * Validate phone number (basic)
         */
        phone(phone) {
            const regex = /^[\+]?[1-9][\d]{0,15}$/;
            return regex.test(phone.replace(/\s/g, ''));
        },
        
        /**
         * Check if string is empty or whitespace
         */
        isEmpty(str) {
            return !str || str.trim().length === 0;
        },
        
        /**
         * Validate minimum length
         */
        minLength(str, min) {
            return str && str.length >= min;
        },
        
        /**
         * Validate maximum length
         */
        maxLength(str, max) {
            return str && str.length <= max;
        }
    },
    
    /**
     * Storage Utilities
     */
    storage: {
        /**
         * Set item in localStorage with error handling
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                return false;
            }
        },
        
        /**
         * Get item from localStorage with error handling
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Failed to read from localStorage:', error);
                return defaultValue;
            }
        },
        
        /**
         * Remove item from localStorage
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Failed to remove from localStorage:', error);
                return false;
            }
        },
        
        /**
         * Clear all localStorage
         */
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Failed to clear localStorage:', error);
                return false;
            }
        },
        
        /**
         * Check if localStorage is available
         */
        isAvailable() {
            try {
                const test = '__localStorage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch {
                return false;
            }
        }
    },
    
    /**
     * Network Utilities
     */
    network: {
        /**
         * Check if online
         */
        isOnline() {
            return navigator.onLine;
        },
        
        /**
         * Fetch with timeout
         */
        async fetchWithTimeout(url, options = {}, timeout = 10000) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        },
        
        /**
         * Simple GET request
         */
        async get(url, options = {}) {
            try {
                const response = await this.fetchWithTimeout(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    ...options
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('GET request failed:', error);
                throw error;
            }
        },
        
        /**
         * Simple POST request
         */
        async post(url, data, options = {}) {
            try {
                const response = await this.fetchWithTimeout(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    body: JSON.stringify(data),
                    ...options
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('POST request failed:', error);
                throw error;
            }
        }
    },
    
    /**
     * Performance Utilities
     */
    performance: {
        /**
         * Debounce function
         */
        debounce(func, wait, immediate = false) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },
        
        /**
         * Throttle function
         */
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        /**
         * Measure execution time
         */
        measureTime(func, label = 'Function') {
            return function(...args) {
                const start = performance.now();
                const result = func.apply(this, args);
                const end = performance.now();
                console.log(`${label} took ${end - start} milliseconds`);
                return result;
            };
        },
        
        /**
         * Request animation frame with fallback
         */
        requestAnimFrame(callback) {
            return (
                window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function(callback) {
                    window.setTimeout(callback, 1000 / 60);
                }
            )(callback);
        }
    },
    
    /**
     * Device Detection
     */
    device: {
        /**
         * Check if mobile device
         */
        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        
        /**
         * Check if tablet
         */
        isTablet() {
            return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
        },
        
        /**
         * Check if desktop
         */
        isDesktop() {
            return !this.isMobile() && !this.isTablet();
        },
        
        /**
         * Check if touch device
         */
        isTouchDevice() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        },
        
        /**
         * Get viewport dimensions
         */
        getViewport() {
            return {
                width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
                height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
            };
        }
    },
    
    /**
     * Color Utilities
     */
    color: {
        /**
         * Convert hex to RGB
         */
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        
        /**
         * Convert RGB to hex
         */
        rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },
        
        /**
         * Generate random color
         */
        random() {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
    },
    
    /**
     * Math Utilities
     */
    math: {
        /**
         * Clamp number between min and max
         */
        clamp(num, min, max) {
            return Math.min(Math.max(num, min), max);
        },
        
        /**
         * Linear interpolation
         */
        lerp(start, end, factor) {
            return start + (end - start) * factor;
        },
        
        /**
         * Map number from one range to another
         */
        map(value, inMin, inMax, outMin, outMax) {
            return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        },
        
        /**
         * Generate random number between min and max
         */
        random(min = 0, max = 1) {
            return Math.random() * (max - min) + min;
        },
        
        /**
         * Generate random integer between min and max
         */
        randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
};

// Make utilities globally available
window.PLSUtils = PLSUtils;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PLSUtils;
}
