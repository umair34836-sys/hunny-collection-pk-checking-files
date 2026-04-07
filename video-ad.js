// Video Advertisement Manager - Works without Firebase
// Stores settings in localStorage for GitHub Pages compatibility

// List of all pages in the website
export const PAGE_LIST = [
    { value: 'index.html', label: '🏠 Home Page' },
    { value: 'shop.html', label: '🛍️ Shop Page' },
    { value: 'product.html', label: '📦 Product Detail Page' },
    { value: 'cart.html', label: '🛒 Cart Page' },
    { value: 'checkout.html', label: '💳 Checkout Page' },
    { value: 'account.html', label: '👤 Account Page' },
    { value: 'orders.html', label: '📋 Orders Page' },
    { value: 'contact.html', label: '📞 Contact Page' },
    { value: 'login.html', label: '🔑 Login Page' },
    { value: 'signup.html', label: '✍️ Signup Page' }
];

// Default video ad settings
const defaultVideoAdSettings = {
    enabled: false,
    mediaFileName: '',
    mediaType: 'video',
    videoTitle: 'Special Offer',
    autoPlay: true,
    showCloseButton: true,
    position: 'top',
    clickUrl: ''
};

// Get current page name
export function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

// Get settings for a specific page
export function getVideoAdSettings(pageName = null) {
    try {
        const currentPage = pageName || getCurrentPage();

        // Get page-specific settings
        const pageSettings = localStorage.getItem(`videoAd_${currentPage}`);

        if (pageSettings) {
            const settings = JSON.parse(pageSettings);
            console.log(`Loaded settings for ${currentPage}:`, settings);
            return {
                ...defaultVideoAdSettings,
                ...settings
            };
        }

        return defaultVideoAdSettings;
    } catch (error) {
        console.error('Error loading video ad settings:', error);
        return defaultVideoAdSettings;
    }
}

// Save settings for a specific page
export function saveVideoAdSettings(pageName, settings) {
    try {
        localStorage.setItem(`videoAd_${pageName}`, JSON.stringify(settings));
        console.log(`Settings saved for ${pageName}:`, settings);
        return true;
    } catch (error) {
        console.error('Error saving video ad settings:', error);
        return false;
    }
}

// Get all page settings
export function getAllPageSettings() {
    const allSettings = {};
    PAGE_LIST.forEach(page => {
        allSettings[page.value] = getVideoAdSettings(page.value);
    });
    return allSettings;
}

// Delete settings for a specific page
export function deletePageSettings(pageName) {
    try {
        localStorage.removeItem(`videoAd_${pageName}`);
        console.log(`Settings deleted for ${pageName}`);
        return true;
    } catch (error) {
        console.error('Error deleting settings:', error);
        return false;
    }
}

// Render video ad on page
export function renderVideoAd() {
    const settings = getVideoAdSettings();

    if (!settings.enabled || !settings.mediaFileName) {
        return;
    }

    const closedSession = sessionStorage.getItem('videoAdClosed');
    if (closedSession && settings.position === 'popup') {
        return;
    }

    // Detect media type from file extension
    const fileExt = settings.mediaFileName.toLowerCase().split('.').pop();
    const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExt);
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);

    const clickUrl = settings.clickUrl || '';
    const clickHandler = clickUrl ? `onclick="window.open('${escapeHtml(clickUrl)}', '_blank')"` : '';
    const cursorStyle = clickUrl ? 'cursor: pointer;' : '';

    let mediaContent = '';

    if (isVideo) {
        // Video content
        mediaContent = `
            <video ${settings.autoPlay ? 'autoplay muted loop playsinline' : 'controls'} id="media-player">
                <source src="assets/${escapeHtml(settings.mediaFileName)}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    } else if (isImage) {
        // Image content
        mediaContent = `
            <img src="assets/${escapeHtml(settings.mediaFileName)}" alt="${escapeHtml(settings.videoTitle)}" id="media-player" style="width: 100%; height: 100%; object-fit: contain;">
        `;
    } else {
        console.error('Unsupported media type:', fileExt);
        return;
    }

    const mediaAdHTML = `
        <section class="video-ad-section" id="media-ad-section">
            <div class="video-ad-container">
                ${settings.videoTitle ? `<h3 class="video-ad-title">${escapeHtml(settings.videoTitle)}</h3>` : ''}
                <div class="video-ad-wrapper" ${clickHandler} style="${cursorStyle}">
                    ${settings.showCloseButton ? '<button class="video-ad-close" onclick="closeMediaAd(event)" aria-label="Close media">✕</button>' : ''}
                    <button class="video-mute-btn" onclick="toggleMute(event)" aria-label="Toggle mute" id="mute-btn" style="display: none;">🔇</button>
                    ${mediaContent}
                </div>
            </div>
        </section>
    `;

    // Choose container based on position setting
    const containerId = settings.position === 'bottom'
        ? 'video-ad-container-bottom'
        : 'video-ad-container-top';
    const container = document.getElementById(containerId);

    if (!container) {
        console.log('Container not found:', containerId);
        return;
    }

    if (container) {
        container.innerHTML = mediaAdHTML;

        const mediaPlayer = document.getElementById('media-player');
        const muteBtn = document.getElementById('mute-btn');

        // Show mute button only for video
        if (mediaPlayer && muteBtn && isVideo) {
            mediaPlayer.onloadedmetadata = function() {
                muteBtn.style.display = 'flex';
            };

            mediaPlayer.onvolumechange = function() {
                muteBtn.textContent = mediaPlayer.muted || mediaPlayer.volume === 0 ? '🔇' : '🔊';
            };
        }

        // Auto-play for video
        if (isVideo && settings.autoPlay) {
            mediaPlayer.play().then(() => {
                console.log('Video autoplayed (muted). User can unmute.');
            }).catch(err => {
                console.log('Auto-play prevented, showing controls:', err);
                mediaPlayer.controls = true;
                if (muteBtn) muteBtn.style.display = 'flex';
            });
        }
    }
}

// Close media ad function (video or image)
window.closeMediaAd = function(event) {
    if (event) event.stopPropagation();
    
    const adSection = document.getElementById('media-ad-section');
    const mediaPlayer = document.getElementById('media-player');
    
    if (adSection) {
        adSection.style.display = 'none';
    }
    
    // Stop video if it's a video
    if (mediaPlayer && mediaPlayer.tagName === 'VIDEO') {
        mediaPlayer.pause();
        mediaPlayer.currentTime = 0;
        mediaPlayer.muted = true;
    }
    
    sessionStorage.setItem('videoAdClosed', 'true');
};

// Toggle mute/unmute (only for video)
window.toggleMute = function(event) {
    if (event) event.stopPropagation();
    
    const mediaPlayer = document.getElementById('media-player');
    const muteBtn = document.getElementById('mute-btn');
    
    if (mediaPlayer && muteBtn && mediaPlayer.tagName === 'VIDEO') {
        if (mediaPlayer.muted) {
            mediaPlayer.muted = false;
            mediaPlayer.volume = 1.0;
            muteBtn.textContent = '🔊';
            muteBtn.style.background = 'rgba(255, 105, 180, 0.9)';
        } else {
            mediaPlayer.muted = true;
            muteBtn.textContent = '🔇';
            muteBtn.style.background = 'rgba(0, 0, 0, 0.7)';
        }
    }
};

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderVideoAd);
} else {
    renderVideoAd();
}
