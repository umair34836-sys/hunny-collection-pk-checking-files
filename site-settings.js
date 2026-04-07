// Site Settings Loader
// This script loads settings from Firestore and applies them to all pages

import { db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Load settings from Firestore
export async function loadSiteSettings() {
    try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));

        if (settingsDoc.exists()) {
            const settings = settingsDoc.data();
            applySettings(settings);
            return settings;
        } else {
            applyDefaultSettings();
            return null;
        }
    } catch (error) {
        // On slow/offline connections, silently use defaults — no console error
        if (error.code === 'unavailable' || error.message.includes('offline')) {
            applyDefaultSettings();
        }
        return null;
    }
}

// Apply settings to the page
function applySettings(settings) {
    // Store Name
    const storeNameElements = document.querySelectorAll('.store-name');
    storeNameElements.forEach(el => {
        if (settings.storeName) el.textContent = settings.storeName;
    });
    document.title = settings.storeName ? settings.storeName + ' - Premium Female Fashion Store' : 'Hunny Collection PK';
    
    // Store Tagline
    const taglineElements = document.querySelectorAll('.store-tagline');
    taglineElements.forEach(el => {
        if (settings.storeTagline) el.textContent = settings.storeTagline;
    });
    
    // Store Description
    const descElements = document.querySelectorAll('.store-description');
    descElements.forEach(el => {
        if (settings.storeDescription) el.textContent = settings.storeDescription;
    });
    
    // WhatsApp Number
    const whatsappElements = document.querySelectorAll('.whatsapp-number');
    whatsappElements.forEach(el => {
        if (settings.whatsappNumber) {
            el.textContent = settings.whatsappNumber;
            el.href = 'https://wa.me/' + settings.whatsappNumber.replace(/[^0-9]/g, '');
        }
    });
    
    // Update WhatsApp float button
    const whatsappFloat = document.getElementById('whatsapp-float');
    if (whatsappFloat && settings.whatsappNumber) {
        whatsappFloat.href = 'https://wa.me/' + settings.whatsappNumber.replace(/[^0-9]/g, '');
    }
    
    // Contact Email
    const emailElements = document.querySelectorAll('.contact-email');
    emailElements.forEach(el => {
        if (settings.contactEmail) el.textContent = settings.contactEmail;
    });
    
    // Location
    const locationElements = document.querySelectorAll('.location');
    locationElements.forEach(el => {
        if (settings.location) el.textContent = settings.location;
    });
    
    // Copyright Text
    const copyrightElements = document.querySelectorAll('.copyright-text');
    copyrightElements.forEach(el => {
        if (settings.copyrightText) {
            el.textContent = settings.copyrightText;
        } else {
            el.textContent = '© ' + new Date().getFullYear() + ' Hunny Collection PK. All rights reserved.';
        }
    });

    // NOTE: SEO Meta Tags are now managed via SEO Dashboard (seo-dashboard.html)
    // Meta tags are hardcoded in HTML files for better SEO performance
    // No Firebase-based SEO updates

    // Shipping Message
    const shippingElements = document.querySelectorAll('.shipping-message');
    shippingElements.forEach(el => {
        if (settings.shippingMessage) el.textContent = settings.shippingMessage;
    });
    
    // Payment Message
    const paymentElements = document.querySelectorAll('.payment-message');
    paymentElements.forEach(el => {
        if (settings.paymentMessage) el.textContent = settings.paymentMessage;
    });
    
    console.log('Settings applied successfully');
}

// Apply default settings if none saved
function applyDefaultSettings() {
    const defaults = {
        storeName: 'Hunny Collection PK',
        storeTagline: 'Your Premium Destination for Female Fashion',
        storeDescription: 'Your premium destination for female fashion. Quality products, affordable prices.',
        whatsappNumber: '+92 301 8858303',
        contactEmail: 'info@hunnycollection.pk',
        location: 'Pakistan',
        copyrightText: '© ' + new Date().getFullYear() + ' Hunny Collection PK. All rights reserved.',
        shippingMessage: 'Free shipping across Pakistan',
        paymentMessage: 'Cash on Delivery available'
    };
    
    applySettings(defaults);
}

// Auto-load settings when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSiteSettings);
} else {
    loadSiteSettings();
}

// Export for manual use
export { applySettings };
