// ============================================
// أفران ومخابز النصر - ملف الإعدادات والتكوين
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB8X0-EXAMPLE-KEY-PLACEHOLDER",
    authDomain: "bakery-store-app.firebaseapp.com",
    projectId: "bakery-store-app",
    storageBucket: "bakery-store-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789"
};

// Global state variables
let db = null;
let auth = null;
let useLocalStorage = true;
let mapsInitialized = {};

// Store information
let storeInfo = {
    name: 'أفران ومخابز النصر',
    logo: 'https://placehold.co/100x100/8d6e63/fff?text=🥐',
    phone: '0500000000',
    deliveryFee: 15,
    minOrder: 50,
    currency: 'ر.س'
};

// Application state
let categories = [];
let products = [];
let branches = [];
let cart = [];
let wishlist = [];
let currentUser = null;
let currentPage = 'home';
let tempMarker = null;

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    
    // Enable offline persistence
    db.enablePersistence().catch((err) => {
        console.log('Offline persistence not available:', err.code);
    });
    
    useLocalStorage = false;
    console.log('✅ Firebase connected successfully');
} catch (e) {
    console.log('⚠️ Firebase not available, using localStorage fallback');
    useLocalStorage = true;
}