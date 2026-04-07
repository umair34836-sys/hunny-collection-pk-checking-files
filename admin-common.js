// Admin Common Utilities - Shared functions across all admin pages
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ========== AUTHENTICATION ==========

// Check if user is admin (UID-based with auto-registration on first login)
export async function isAdmin(user) {
    try {
        if (!user || !user.email) {
            console.log('❌ isAdmin: No user or email');
            return false;
        }

        console.log('🔍 Checking admin status for:', user.email);
        console.log('🔑 User UID:', user.uid);

        // STEP 1: Fast check - try UID as document ID
        try {
            console.log('⚡ Trying UID lookup...');
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            
            if (adminDoc.exists()) {
                console.log('✅ Admin found by UID (fast path)');
                console.log('Admin data:', adminDoc.data());
                return true;
            }
            console.log('UID document not found');
        } catch (err) {
            console.warn('⚠️ UID check error:', err.message);
        }

        // STEP 2: Fallback - search by email
        try {
            console.log('🔍 Trying email lookup...');
            const q = query(collection(db, 'admins'), where('email', '==', user.email));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                console.log('✅ Admin found by email');
                
                const oldDoc = snapshot.docs[0];
                const oldDocId = oldDoc.id;
                
                // Only migrate if document ID is not the UID
                if (oldDocId !== user.uid) {
                    console.log('🔄 Migrating to UID-based document...');
                    
                    try {
                        await setDoc(doc(db, 'admins', user.uid), {
                            email: user.email,
                            uid: user.uid,
                            migrated: true,
                            migratedAt: new Date().toISOString()
                        });
                        console.log('✅ Created UID-based admin document');
                        
                        // Try to delete old document
                        try {
                            await deleteDoc(oldDoc.ref);
                            console.log('🗑️ Deleted old admin document');
                        } catch (delErr) {
                            console.warn('⚠️ Could not delete old doc:', delErr.message);
                        }
                    } catch (migErr) {
                        console.warn('⚠️ Migration failed:', migErr.message);
                    }
                }
                
                return true;
            }
            console.log('No admin found with email:', user.email);
        } catch (queryErr) {
            console.warn('⚠️ Email query failed:', queryErr.message);
            console.warn('This might be due to missing index or permissions');
        }

        // STEP 3: Auto-register as admin if not found
        console.log('🆕 Admin not found in Firestore. Auto-registering...');
        
        try {
            await setDoc(doc(db, 'admins', user.uid), {
                email: user.email,
                uid: user.uid,
                role: 'super-admin',
                createdAt: new Date().toISOString(),
                autoRegistered: true
            });
            
            console.log('✅ Successfully auto-registered as admin!');
            console.log('📋 Admin document created:');
            console.log('   Collection: admins');
            console.log('   Document ID:', user.uid);
            console.log('   Email:', user.email);
            console.log('');
            console.log('🎉 You can now use the admin panel!');
            
            return true;
        } catch (createErr) {
            console.error('❌ Failed to auto-register admin:', createErr.message);
            console.error('Error code:', createErr.code);
            
            // Show helpful error to user
            console.warn('');
            console.warn('📋 MANUAL SETUP REQUIRED:');
            console.warn('1. Go to: https://console.firebase.google.com');
            console.warn('2. Select project: hunny-collection-pk');
            console.warn('3. Go to Firestore Database');
            console.warn('4. Click "Start collection"');
            console.warn('5. Collection ID: admins');
            console.warn('6. Document ID: ' + user.uid);
            console.warn('7. Add field: email (string) = ' + user.email);
            console.warn('8. Click Save');
            console.warn('9. Refresh this page');
            
            return false;
        }
    } catch (error) {
        console.error('❌ Unexpected error in isAdmin:', error);
        console.error('Error code:', error?.code, 'Message:', error?.message);
        return false;
    }
}

// Admin authentication checker
export async function checkAdminAuth() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe(); // Unsubscribe after first check

            if (!user) {
                console.log('No user logged in, redirecting to login');
                window.location.href = '/.html';
                resolve(false);
                return;
            }

            const adminCheck = await isAdmin(user);
            if (!adminCheck) {
                const errorMsg = `NOT AUTHORIZED AS ADMIN\n\nYour email: ${user.email}\n\nPlease add this email to Firestore:\n1. Go to Firestore Database\n2. Create collection: admins\n3. Add document with field: email = ${user.email}`;
                console.error(errorMsg);
                alert(errorMsg);
                window.location.href = '/.html';
                resolve(false);
                return;
            }

            console.log('Admin authorized!');
            resolve(true);
        });
    });
}

// Logout function
export async function logout() {
    try {
        await signOut(auth);
        alert('Logged out successfully!');
        window.location.href = '/';
    } catch (error) {
        alert('Error logging out: ' + error.message);
    }
}

// ========== NAVIGATION ==========

// Update auth link in header
export function updateAuthLink(user) {
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;

    if (user) {
        authLink.textContent = '👤 Account';
        authLink.href = param($m) '''' + '/' + [System.IO.Path]::GetFileNameWithoutExtension($m.Value.Trim('''')) + '''';
    } else {
        authLink.textContent = 'Login';
        authLink.href = param($m) '''' + '/' + [System.IO.Path]::GetFileNameWithoutExtension($m.Value.Trim('''')) + '''';
    }
}

// Show/hide sections (for single-page admin)
export function showSection(sectionName, sectionPrefix = 'section') {
    // Hide all sections
    document.querySelectorAll(`[id^="${sectionPrefix}-"]`).forEach(el => {
        el.style.display = 'none';
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionPrefix}-${sectionName}`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    // Update sidebar active state
    document.querySelectorAll('.admin-sidebar a, .sidebar a').forEach(a => {
        a.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Close mobile sidebar
    closeMobileSidebar();
}

// ========== MOBILE SIDEBAR ==========

// Toggle mobile sidebar
export function toggleMobileSidebar() {
    const sidebar = document.querySelector('.admin-sidebar, .sidebar');
    const overlay = document.querySelector('.admin-overlay, .sidebar-overlay');
    
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// Close mobile sidebar
export function closeMobileSidebar() {
    const sidebar = document.querySelector('.admin-sidebar, .sidebar');
    const overlay = document.querySelector('.admin-overlay, .sidebar-overlay');

    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// Setup sidebar link close handlers - call once per page
export function setupSidebarCloseHandlers() {
    document.querySelectorAll('.admin-sidebar a, .sidebar a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileSidebar();
        });
    });
}

// ========== UTILITY FUNCTIONS ==========

// Format currency
export function formatCurrency(amount, currency = 'Rs.') {
    return `${currency} ${(amount || 0).toLocaleString()}`;
}

// Format date
export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Format date with time
export function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Get status badge class
export function getStatusBadgeClass(status) {
    const statusMap = {
        'pending': 'badge-pending',
        'confirmed': 'badge-confirmed',
        'shipped': 'badge-shipped',
        'delivered': 'badge-delivered',
        'cancelled': 'badge-cancelled',
        'approved': 'badge-delivered',
        'rejected': 'badge-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'badge-pending';
}

// Get status badge HTML
export function getStatusBadge(status) {
    const badgeClass = getStatusBadgeClass(status);
    return `<span class="badge ${badgeClass}">${(status || 'Pending').toUpperCase()}</span>`;
}

// Show loading state
export function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="loading" style="text-align: center; padding: 40px; color: var(--text-light);">${message}</div>`;
    }
}

// Show error message
export function showError(message, containerId = null) {
    const errorHtml = `<div class="alert alert-error" style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0;">${message}</div>`;
    
    if (containerId) {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = errorHtml;
    } else {
        alert(message);
    }
}

// Show success message
export function showSuccess(message) {
    alert(message);
}

// Confirm action
export function confirmAction(message) {
    return confirm(message);
}

// Debounce function for search inputs
export function debounce(func, wait) {
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

// ========== IMAGE HANDLING ==========

// Validate image URL
export function isValidImageUrl(url) {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
}

// Upload image to ImgBB (opens guide)
export function openUploadGuide() {
    window.open('https://imgbb.com/', '_blank');
}

// ========== SHARING ==========

// Share on Facebook
export function shareOnFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
}

// Share on WhatsApp
export function shareOnWhatsApp() {
    const text = 'Check out Hunny Collection PK - Your premium destination for female fashion!';
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
}

// Share on Instagram
export function shareOnInstagram() {
    alert('📸 To share on Instagram:\n1. Copy the store link\n2. Open Instagram\n3. Create a story\n4. Paste the link');
    copyStoreLink();
}

// Copy store link
export function copyStoreLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('✅ Store link copied to clipboard!');
    }).catch(() => {
        prompt('Copy this link:', url);
    });
}

// ========== GLOBAL EXPORTS ==========

// Make functions available globally for inline onclick handlers
export function makeGlobalFunctions() {
    window.logout = logout;
    window.showSection = showSection;
    window.toggleMobileSidebar = toggleMobileSidebar;
    window.closeMobileSidebar = closeMobileSidebar;
    window.shareOnFacebook = shareOnFacebook;
    window.shareOnWhatsApp = shareOnWhatsApp;
    window.shareOnInstagram = shareOnInstagram;
    window.copyStoreLink = copyStoreLink;
    window.openUploadGuide = openUploadGuide;
}
