// SEO Configuration - Static Frontend SEO
// This file contains all SEO meta tags for every page
// Edit this file OR use Admin Panel SEO Dashboard to update
// Last Updated: March 20, 2026 - Basic SEO Setup Complete
// OG Images: Custom images added

const BASE_URL = "https://umair34836-sys.github.io/Hunny-Collection-PK-v2";

export const SEO_DATA = {
  // Home Page
  index: {
    title: "Hunny Collection PK - Premium Female Fashion Store in Pakistan | Dresses, Kurtis, Jewelry",
    description: "Shop premium female fashion at Hunny Collection PK. Discover trendy dresses, kurtis, jewelry, bags & shoes. Cash on Delivery ✓ Fast Shipping ✓ Best Prices in Pakistan.",
    keywords: "hunny collection pk, female fashion pakistan, dresses online, kurtis pakistan, jewelry online, bags for women, shoes pakistan, cash on delivery, online shopping pakistan, fashion store",
    ogImage: "https://i.ibb.co/wrcXdHfM/home.jpg",
    canonical: `${BASE_URL}/index.html`,
    robots: "index, follow"
  },

  // Shop Page
  shop: {
    title: "Shop All Products - Hunny Collection PK | Latest Fashion Collection 2026",
    description: "Browse our complete collection of premium female fashion. Latest dresses, kurtis, jewelry, bags & shoes. COD available ✓ Fast delivery across Pakistan ✓ New arrivals daily.",
    keywords: "shop dresses, kurtis online, jewelry pakistan, bags for women, shoes online, fashion store pakistan, cash on delivery, latest collection 2026, women fashion, pakistani clothing",
    ogImage: "https://i.ibb.co/TqcTWWmY/shop.jpg",
    canonical: `${BASE_URL}/shop.html`,
    robots: "index, follow"
  },

  // Product Detail Page
  product: {
    title: "Product Details - Hunny Collection PK | Buy Fashion Online Pakistan",
    description: "View product details, prices and order online from Hunny Collection PK. Quality guaranteed ✓ Cash on Delivery ✓ Easy returns ✓ Fast shipping across Pakistan.",
    keywords: "product details, buy fashion online, pakistan clothing, women dresses, order online, cash on delivery pakistan, fashion products, hunny collection",
    ogImage: "https://i.ibb.co/ymfRN5Lm/product.jpg",
    canonical: `${BASE_URL}/product.html`,
    robots: "index, follow"
  },

  // Cart Page
  cart: {
    title: "Shopping Cart - Hunny Collection PK | Review Your Order",
    description: "Review your shopping cart and proceed to checkout at Hunny Collection PK. Secure checkout ✓ Cash on Delivery ✓ Fast shipping across Pakistan.",
    keywords: "shopping cart, checkout, online shopping pakistan, review order, hunny collection cart, fashion cart",
    ogImage: "https://i.ibb.co/QvQWdDD3/cart.jpg",
    canonical: `${BASE_URL}/cart.html`,
    robots: "noindex, follow"
  },

  // Checkout Page
  checkout: {
    title: "Checkout - Hunny Collection PK | Secure Order Placement",
    description: "Complete your order securely at Hunny Collection PK. Easy checkout process ✓ Cash on Delivery available ✓ Fast delivery across Pakistan.",
    keywords: "checkout, order now, secure payment, pakistan, cash on delivery, online order, fashion checkout",
    ogImage: "https://i.ibb.co/C5CGqLpj/checkout.jpg",
    canonical: `${BASE_URL}/checkout.html`,
    robots: "noindex, nofollow"
  },

  // Contact Page
  contact: {
    title: "Contact Us - Hunny Collection PK | WhatsApp +92 301 8858303 | Customer Support",
    description: "Get in touch with Hunny Collection PK. WhatsApp: +92 301 8858303 | Email: MrCopper804@gmail.com | Fast response ✓ Customer support ✓ Pakistan.",
    keywords: "contact us, whatsapp +92 301 8858303, customer support pakistan, hunny collection contact, email support, fashion store contact, pakistan",
    ogImage: "https://i.ibb.co/My7jTvsd/contect.jpg",
    canonical: `${BASE_URL}/contact.html`,
    robots: "index, follow"
  },

  // Account Page
  account: {
    title: "My Account - Hunny Collection PK | Manage Orders & Profile",
    description: "Manage your Hunny Collection PK account. View order history, track deliveries, update profile. Secure customer portal for online shopping in Pakistan.",
    keywords: "my account, order history, track order, pakistan, customer portal, hunny collection account, manage profile",
    ogImage: "https://i.ibb.co/gLZhmJtc/account.jpg",
    canonical: `${BASE_URL}/account.html`,
    robots: "noindex, follow"
  },

  // Login Page
  login: {
    title: "Login - Hunny Collection PK | Access Your Account",
    description: "Login to your Hunny Collection PK account. Access your orders, wishlist, and profile. Secure login for online fashion shopping in Pakistan.",
    keywords: "login, sign in, account access, pakistan, hunny collection login, customer login",
    ogImage: "https://i.ibb.co/sJ6yd55P/login.jpg",
    canonical: `${BASE_URL}/login.html`,
    robots: "noindex, follow"
  },

  // Signup Page
  signup: {
    title: "Sign Up - Hunny Collection PK | Create Account & Get Exclusive Deals",
    description: "Create your Hunny Collection PK account. Get exclusive deals, offers & early access to new collections. Join Pakistan's premium fashion store today!",
    keywords: "sign up, register, create account, pakistan, hunny collection signup, exclusive deals, fashion offers",
    ogImage: "https://i.ibb.co/6dV2N1L/singup.jpg",
    canonical: `${BASE_URL}/signup.html`,
    robots: "noindex, follow"
  },

  // Admin Page
  admin: {
    title: "Admin Panel - Hunny Collection PK | Store Management",
    description: "Admin dashboard for managing products, orders, categories and settings. Hunny Collection PK store management system.",
    keywords: "admin, dashboard, manage products, orders, store management",
    ogImage: "https://i.ibb.co/wrcXdHfM/home.jpg",
    canonical: `${BASE_URL}/admin.html`,
    robots: "noindex, nofollow"
  },

  // Orders Page
  orders: {
    title: "My Orders - Hunny Collection PK | Track Your Orders",
    description: "View and track your orders from Hunny Collection PK. Order history, delivery status, tracking details. All your purchases in one place.",
    keywords: "my orders, order history, track delivery, pakistan, hunny collection orders, order tracking",
    ogImage: "https://i.ibb.co/gLZhmJtc/account.jpg",
    canonical: `${BASE_URL}/orders.html`,
    robots: "noindex, follow"
  },

  // Settings Page
  settings: {
    title: "Site Settings - Hunny Collection PK | Admin Configuration",
    description: "Manage site settings, SEO, contact info, shipping and payment configuration. Hunny Collection PK admin settings panel.",
    keywords: "settings, admin, configuration, seo settings, site management",
    ogImage: "https://i.ibb.co/wrcXdHfM/home.jpg",
    canonical: `${BASE_URL}/settings.html`,
    robots: "noindex, nofollow"
  }
};

// Page mapping for UI
export const PAGE_NAMES = {
