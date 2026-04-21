/**
 * Chef King's House of Food - Custom Package & Booking Application
 */

(function() {
    'use strict';

    // === CONFIGURATION ===
    const CONFIG = {
        PHONE_NUMBER: '2347050216396',
        STORAGE_KEY: 'chefking_package',
        CURRENCY: '₦'
    };

    // === STATE ===
    let customPackage = [];

    // === INITIALIZATION ===
    document.addEventListener('DOMContentLoaded', function() {
        loadPackageFromStorage();
        updatePackageUI();
        initParticles();
        initNavbarScroll();
        
        // Set minimum date to today
        const dateInput = document.getElementById('eventDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
        
        // Keyboard support
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeCustomPackage();
            }
        });
    });

    // === PARTICLES ===
    function initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        const particleCount = 25;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 10) + 's';
            particle.style.width = (Math.random() * 4 + 2) + 'px';
            particle.style.height = particle.style.width;
            container.appendChild(particle);
        }
    }

    // === NAVBAR SCROLL ===
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // === SANITIZATION ===
    function sanitize(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // === LOCAL STORAGE ===
    function savePackageToStorage() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(customPackage));
        } catch (e) {
            console.warn('Could not save package:', e);
        }
    }

    function loadPackageFromStorage() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    customPackage = parsed;
                }
            }
        } catch (e) {
            customPackage = [];
        }
    }

    // === VALIDATION ===
    function validateItem(name) {
        return typeof name === 'string' && name.trim().length > 0;
    }

     // === ADD TO CUSTOM PACKAGE ===
    window.addToPackage = function(name) {
        if (!validateItem(name)) return;
        
        const existing = customPackage.find(item => item.name === name);
        if (existing) {
            showNotification(sanitize(name) + ' is already in your package', 'info');
            openCustomPackage();
            return;
        }
        
        customPackage.push({ 
            name: name.trim(), 
            quantity: 1 
        });

        savePackageToStorage();
        updatePackageUI();
        showNotification(sanitize(name) + ' added to package');
    };

    // === UPDATE PACKAGE UI ===
    window.updatePackageUI = function() {
        const packageItems = document.getElementById('packageItems');
        const packageCount = document.getElementById('packageCount');
        const packageItemCount = document.getElementById('packageItemCount');

        if (!packageItems || !packageCount || !packageItemCount) return;

        const totalItems = customPackage.length;

        if (customPackage.length === 0) {
            packageItems.innerHTML = `
                <div class="empty-package">
                    <div class="empty-package-icon">🍽️</div>
                    <p>Your package is empty</p>
                    <span>Browse the menu and add items</span>
                </div>
            `;
        } else {
            packageItems.innerHTML = '';
            
            customPackage.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'package-item';
                itemEl.innerHTML = `
                    <div class="package-item-name">${sanitize(item.name)}</div>
                    <div class="package-item-row">
                        <div class="quantity-input-wrapper">
                            <span class="qty-label">Qty:</span>
                            <input type="number" 
                                   class="qty-input" 
                                   value="${item.quantity}" 
                                   min="1" 
                                   onchange="updateQuantity(${index}, this.value)"
                                   onclick="this.select()">
                        </div>
                        <button type="button" class="remove-btn" onclick="removeFromPackage(${index})">Remove</button>
                    </div>
                `;
                packageItems.appendChild(itemEl);
            });
        }

        packageCount.textContent = totalItems;
        packageItemCount.textContent = totalItems + (totalItems === 1 ? ' item' : ' items');
    };

    // === UPDATE QUANTITY ===
    window.updateQuantity = function(index, value) {
        if (index < 0 || index >= customPackage.length) return;
        
        const newQuantity = parseInt(value);
        if (isNaN(newQuantity) || newQuantity < 1) {
            updatePackageUI();
            return;
        }
        
        customPackage[index].quantity = newQuantity;
        savePackageToStorage();
        updatePackageUI();
    };

    // === REMOVE ITEM ===
    window.removeFromPackage = function(index) {
        if (index < 0 || index >= customPackage.length) return;
        
        const itemName = customPackage[index].name;
        customPackage.splice(index, 1);
        
        savePackageToStorage();
        updatePackageUI();
        showNotification(sanitize(itemName) + ' removed', 'info');
    };

     // === TOGGLE CUSTOM PACKAGE SIDEBAR ===
    window.toggleCustomPackage = function() {
        const sidebar = document.getElementById('packageSidebar');
        if (sidebar.classList.contains('open')) {
            closeCustomPackage();
        } else {
            openCustomPackage();
        }
    };

    // === OPEN PACKAGE SIDEBAR ===
    window.openCustomPackage = function() {
        const sidebar = document.getElementById('packageSidebar');
        const overlay = document.getElementById('packageOverlay');
        const body = document.body;

        if (!sidebar || !overlay) return;

        sidebar.classList.add('open');
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
    };

    // === CLOSE PACKAGE SIDEBAR ===
    window.closeCustomPackage = function() {
        const sidebar = document.getElementById('packageSidebar');
        const overlay = document.getElementById('packageOverlay');
        const body = document.body;

        if (!sidebar || !overlay) return;

        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        body.style.overflow = '';
    };

    // === TOGGLE MOBILE MENU ===
    window.toggleMobileMenu = function() {
        const navLinks = document.getElementById('navLinks');
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (navLinks) {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('active');
        }
    };

    // === FILTER MENU ===
    window.filterMenu = function(category, btnElement) {
        const items = document.querySelectorAll('.menu-item');
        const buttons = document.querySelectorAll('.filter-btn');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        if (btnElement) btnElement.classList.add('active');

        items.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'flex';
                item.style.animation = 'fade-in-up 0.4s ease-out';
            } else {
                item.style.display = 'none';
            }
        });
    };

    // === SELECT FIXED PACKAGE (Straight to WhatsApp) ===
    window.selectFixedPackage = function(name) {
        if (!validateItem(name)) return;
        
        let message = "Hello Chef King's House of Food! 👑\n\n";
        message += "I'm interested in your *" + sanitize(name) + "* catering package.\n\n";
        message += "Please send me the pricing and availability details.\n\n";
        message += "Name:\nPhone:\nEvent Date:\nNumber of Guests:\nLocation:";

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${CONFIG.PHONE_NUMBER}?text=${encodedMessage}`, "_blank");
        
        showNotification('Opening WhatsApp for ' + sanitize(name) + '...');
    };

    // === BOOKING FORM ===
    window.handleBooking = function(e) {
        e.preventDefault();

        const name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const eventType = document.getElementById('eventType').value;
        const date = document.getElementById('eventDate').value;
        const guests = parseInt(document.getElementById('guests').value);
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !phone || !eventType || !date || !guests) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (guests < 1) {
            showNotification('Guests must be at least 1', 'error');
            return;
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showNotification('Event date cannot be in the past', 'error');
            return;
        }

        let whatsappMessage = "Hello Chef King's House of Food! 👑\n\n";
        whatsappMessage += "*New Event Booking Request*\n\n";
        whatsappMessage += `Name: ${name}\n`;
        whatsappMessage += `Email: ${email}\n`;
        whatsappMessage += `Phone: ${phone}\n`;
        whatsappMessage += `Event Type: ${eventType}\n`;
        whatsappMessage += `Date: ${date}\n`;
        whatsappMessage += `Guests: ${guests}\n`;
        
        if (message) {
            whatsappMessage += `\nAdditional Notes:\n${message}\n`;
        }

        const encodedMessage = encodeURIComponent(whatsappMessage);
        window.open(`https://wa.me/${CONFIG.PHONE_NUMBER}?text=${encodedMessage}`, "_blank");
        
        e.target.reset();
        showNotification('Booking request sent! Redirecting to WhatsApp...', 'success');
    };

     // === SEND CUSTOM PACKAGE TO WHATSAPP ===
    window.sendCustomPackage = function() {
        if (customPackage.length === 0) {
            showNotification('Your package is empty', 'error');
            return;
        }

        let message = "Hello Chef King's House of Food! 👑\n\n";
        message += "*My Custom Package Order:*\n\n";

        customPackage.forEach(item => {
            message += `• ${sanitize(item.name)} — Qty: ${item.quantity}\n`;
        });

        message += "\nPlease send me a quote for this package.\n\n";
        message += "Name:\nPhone:\nDelivery Address:\nEvent Date (if any):";

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${CONFIG.PHONE_NUMBER}?text=${encodedMessage}`, "_blank");

        showNotification('Opening WhatsApp with your custom package...', 'success');
        
        // Optional: clear package after sending
        // customPackage = [];
        // savePackageToStorage();
        // updatePackageUI();
        // closeCustomPackage();
    };

    // === NOTIFICATION SYSTEM ===
    function showNotification(msg, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.textContent = msg;
        notification.setAttribute('role', 'alert');

        document.body.appendChild(notification);

        // Trigger reflow
        notification.offsetHeight;

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

})();
        
