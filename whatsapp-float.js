// Floating WhatsApp Button Component
function createWhatsAppButton() {
    // Check if button already exists
    if (document.getElementById('whatsapp-float')) {
        return;
    }

    // Create button
    const whatsappBtn = document.createElement('a');
    whatsappBtn.id = 'whatsapp-float';
    whatsappBtn.className = 'whatsapp-float';
    whatsappBtn.href = 'https://wa.me/923018858303';
    whatsappBtn.target = '_blank';
    whatsappBtn.rel = 'noopener noreferrer';
    whatsappBtn.title = 'Chat with us on WhatsApp';
    
    // WhatsApp icon (SVG)
    whatsappBtn.innerHTML = `
        <svg viewBox="0 0 32 32" style="width: 35px; height: 35px; fill: white;">
            <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.924 0-7.435 6.065-13.5 13.5-13.5s13.5 6.065 13.5 13.5-6.065 13.5-13.5 13.5zM21.558 18.201c-0.212-0.106-1.246-0.612-1.438-0.681s-0.333-0.106-0.473 0.106c-0.141 0.212-0.545 0.681-0.668 0.826s-0.246 0.159-0.457 0.053c-1.184-0.587-1.964-1.049-2.742-2.376-0.204-0.347 0.204-0.322 0.587-1.072 0.064-0.141 0.032-0.265-0.018-0.371s-0.473-1.127-0.649-1.545c-0.17-0.406-0.344-0.351-0.473-0.357-0.122-0.006-0.263-0.006-0.404-0.006s-0.368 0.053-0.561 0.265c-0.193 0.212-0.736 0.718-0.736 1.751s0.754 2.032 0.859 2.173c0.106 0.141 1.48 2.396 3.621 3.293 1.431 0.601 1.775 0.481 2.092 0.451 0.668-0.063 1.246-0.506 1.422-0.995s0.176-0.908 0.123-0.995c-0.053-0.088-0.193-0.141-0.404-0.247z"/>
        </svg>
        <span class="whatsapp-tooltip">Chat with us!</span>
    `;

    // Add to page
    document.body.appendChild(whatsappBtn);

    // Add click handler
    whatsappBtn.addEventListener('click', function(e) {
        // You can add analytics tracking here
        console.log('WhatsApp button clicked!');
    });
}

// Auto-initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWhatsAppButton);
} else {
    createWhatsAppButton();
}
