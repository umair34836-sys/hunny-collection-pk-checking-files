// Admin API - All Firestore CRUD operations
import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ========== PRODUCTS ==========

// Get all products
export async function getAllProducts() {
    try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting products:', error);
        throw error;
    }
}

// Get single product
export async function getProduct(productId) {
    try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting product:', error);
        throw error;
    }
}

// Create product
export async function createProduct(productData) {
    try {
        productData.createdAt = new Date().toISOString();
        productData.updatedAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'products'), productData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

// Update product
export async function updateProduct(productId, productData) {
    try {
        productData.updatedAt = new Date().toISOString();
        const docRef = doc(db, 'products', productId);
        await updateDoc(docRef, productData);
        return true;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

// Delete product
export async function deleteProduct(productId) {
    try {
        await deleteDoc(doc(db, 'products', productId));
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// Bulk delete products
export async function bulkDeleteProducts(productIds) {
    try {
        const promises = productIds.map(id => deleteDoc(doc(db, 'products', id)));
        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('Error bulk deleting products:', error);
        throw error;
    }
}

// Bulk update stock
export async function bulkUpdateStock(productIds, stockQuantity) {
    try {
        const promises = productIds.map(id => 
            updateDoc(doc(db, 'products', id), { 
                stockQuantity: Number(stockQuantity) || 0 
            })
        );
        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('Error bulk updating stock:', error);
        throw error;
    }
}

// ========== ORDERS ==========

// Get all orders
export async function getAllOrders() {
    try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting orders:', error);
        throw error;
    }
}

// Get single order
export async function getOrder(orderId) {
    try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting order:', error);
        throw error;
    }
}

// Update order status
export async function updateOrderStatus(orderId, status) {
    try {
        const docRef = doc(db, 'orders', orderId);
        await updateDoc(docRef, {
            status,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

// ========== REVIEWS ==========

// Get all reviews
export async function getAllReviews(filter = 'all') {
    try {
        const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        let reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (filter !== 'all') {
            reviews = reviews.filter(r => r.status === filter);
        }

        return reviews;
    } catch (error) {
        console.error('Error getting reviews:', error);
        throw error;
    }
}

// Update review status
export async function updateReviewStatus(reviewId, status) {
    try {
        const docRef = doc(db, 'reviews', reviewId);
        await updateDoc(docRef, {
            status,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error updating review status:', error);
        throw error;
    }
}

// Reply to review
export async function replyToReview(reviewId, reply) {
    try {
        const docRef = doc(db, 'reviews', reviewId);
        await updateDoc(docRef, {
            adminReply: reply,
            replyAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error replying to review:', error);
        throw error;
    }
}

// Delete review
export async function deleteReview(reviewId) {
    try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        return true;
    } catch (error) {
        console.error('Error deleting review:', error);
        throw error;
    }
}

// ========== CATEGORIES ==========

// Get all categories
export async function getAllCategories() {
    try {
        const snapshot = await getDocs(collection(db, 'categories'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting categories:', error);
        throw error;
    }
}

// Create category
export async function createCategory(name) {
    try {
        const categoryData = {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'categories'), categoryData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
}

// Delete category
export async function deleteCategory(categoryId) {
    try {
        await deleteDoc(doc(db, 'categories', categoryId));
        return true;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}

// ========== DIGITAL PRODUCTS ==========

// Get all digital products
export async function getAllDigitalProducts() {
    try {
        const q = query(collection(db, 'digital-products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting digital products:', error);
        throw error;
    }
}

// Create digital product
export async function createDigitalProduct(productData) {
    try {
        productData.createdAt = new Date().toISOString();
        productData.updatedAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'digital-products'), productData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating digital product:', error);
        throw error;
    }
}

// Update digital product
export async function updateDigitalProduct(productId, productData) {
    try {
        productData.updatedAt = new Date().toISOString();
        const docRef = doc(db, 'digital-products', productId);
        await updateDoc(docRef, productData);
        return true;
    } catch (error) {
        console.error('Error updating digital product:', error);
        throw error;
    }
}

// Delete digital product
export async function deleteDigitalProduct(productId) {
    try {
        await deleteDoc(doc(db, 'digital-products', productId));
        return true;
    } catch (error) {
        console.error('Error deleting digital product:', error);
        throw error;
    }
}

// ========== DIGITAL CATEGORIES ==========

// Get all digital categories
export async function getAllDigitalCategories() {
    try {
        const snapshot = await getDocs(collection(db, 'digital-categories'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting digital categories:', error);
        throw error;
    }
}

// Create digital category
export async function createDigitalCategory(name) {
    try {
        const categoryData = {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'digital-categories'), categoryData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating digital category:', error);
        throw error;
    }
}

// Delete digital category
export async function deleteDigitalCategory(categoryId) {
    try {
        await deleteDoc(doc(db, 'digital-categories', categoryId));
        return true;
    } catch (error) {
        console.error('Error deleting digital category:', error);
        throw error;
    }
}

// ========== DIGITAL ORDERS ==========

// Get all digital orders
export async function getAllDigitalOrders() {
    try {
        const q = query(collection(db, 'digital-orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting digital orders:', error);
        throw error;
    }
}

// ========== STATS & ANALYTICS ==========

// Get dashboard stats
export async function getDashboardStats() {
    try {
        const [products, orders] = await Promise.all([
            getAllProducts(),
            getAllOrders()
        ]);

        const totalProducts = products.length;
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const totalRevenue = orders
            .filter(o => o.status === 'delivered' || o.status === 'confirmed')
            .reduce((sum, o) => sum + (o.total || 0), 0);

        return {
            totalProducts,
            totalOrders,
            pendingOrders,
            totalRevenue
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        throw error;
    }
}

// ========== FILE/IMAGE UPLOAD HELPERS ==========

// Upload file to storage (placeholder for future implementation)
export async function uploadFile(file, path) {
    // TODO: Implement Firebase Storage upload
    console.log('Upload file:', file, 'to:', path);
    throw new Error('File upload not implemented yet');
}

// Get download URL for file
export async function getDownloadURL(filePath) {
    // TODO: Implement Firebase Storage download
    console.log('Get download URL for:', filePath);
    throw new Error('File download not implemented yet');
}
