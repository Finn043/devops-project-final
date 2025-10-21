import express from 'express';
import client from 'prom-client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Sample technology products data
const products = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    price: 1000,
    category: "smartphones",
    description: "The latest iPhone with advanced camera system and titanium design",
    image: "/images/iphone15pro.jpg",
    specifications: {
      "Display": "6.1-inch Super Retina XDR",
      "Chip": "A17 Pro",
      "Camera": "48MP Main, 12MP Ultra Wide",
      "Storage": "128GB, 256GB, 512GB, 1TB",
      "Battery": "Up to 23 hours video playback"
    }
  },
  {
    id: 2,
    name: "MacBook Pro 14\"",
    price: 1999,
    category: "laptops",
    description: "Powerful laptop with M3 chip for professional workflows",
    image: "/images/macbookpro14.jpg",
    specifications: {
      "Display": "14.2-inch Liquid Retina XDR",
      "Chip": "Apple M3 Pro",
      "Memory": "18GB unified memory",
      "Storage": "512GB SSD",
      "Battery": "Up to 18 hours"
    }
  },
  {
    id: 3,
    name: "Samsung Galaxy S24 Ultra",
    price: 1199,
    category: "smartphones",
    description: "Premium Android phone with S Pen and AI features",
    image: "/images/galaxys24ultra.jpg",
    specifications: {
      "Display": "6.8-inch Dynamic AMOLED 2X",
      "Processor": "Snapdragon 8 Gen 3",
      "Camera": "200MP Main, 50MP Periscope Telephoto",
      "Storage": "256GB, 512GB, 1TB",
      "S Pen": "Built-in S Pen included"
    }
  },
  {
    id: 4,
    name: "Dell XPS 13",
    price: 1299,
    category: "laptops",
    description: "Ultra-portable laptop with stunning InfinityEdge display",
    image: "/images/dellxps13.jpg",
    specifications: {
      "Display": "13.4-inch FHD+ InfinityEdge",
      "Processor": "Intel Core i7-1360P",
      "Memory": "16GB LPDDR5",
      "Storage": "512GB PCIe SSD",
      "Weight": "2.59 lbs"
    }
  },
  {
    id: 5,
    name: "iPad Pro 12.9\"",
    price: 1099,
    category: "tablets",
    description: "Most advanced iPad with M2 chip and Liquid Retina XDR display",
    image: "/images/ipadpro.jpg",
    specifications: {
      "Display": "12.9-inch Liquid Retina XDR",
      "Chip": "Apple M2",
      "Storage": "128GB, 256GB, 512GB, 1TB, 2TB",
      "Camera": "12MP Wide, 10MP Ultra Wide",
      "Apple Pencil": "Compatible with Apple Pencil (2nd generation)"
    }
  },
  {
    id: 6,
    name: "AirPods Pro (2nd gen)",
    price: 249,
    category: "accessories",
    description: "Wireless earbuds with active noise cancellation",
    image: "/images/airpodspro.jpg",
    specifications: {
      "Audio": "Adaptive Audio, Active Noise Cancellation",
      "Chip": "Apple H2",
      "Battery": "Up to 6 hours listening time",
      "Case": "MagSafe Charging Case",
      "Water Resistance": "IPX4"
    }
  }
];

// In-memory cart storage (in production, use database/session storage)
const carts = new Map();

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- NEW METRICS ---
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['route', 'method', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDuration);

const buildInfo = new client.Gauge({
  name: 'app_build_info',
  help: 'Build metadata as labels',
  labelNames: ['version', 'git_sha']
});
register.registerMetric(buildInfo);
// -------------------

// --- MIDDLEWARE TO TRACK METRICS ---
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  buildInfo.set({ 
    version: process.env.APP_VERSION || 'dev', 
    git_sha: process.env.GIT_SHA || 'dev' 
  }, 1);

  res.on('finish', () => {
    end({ route: req.path, method: req.method, status: res.statusCode });
  });
  next();
});
// ------------------------------------

app.get('/', (req, res) => {
  const ecommerceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TechStore - Premium Technology Devices</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <header class="header">
        <div class="container">
          <h1 class="logo">TechStore</h1>
          <nav class="nav">
            <a href="/" class="nav-link active">Home</a>
            <a href="/products/smartphones" class="nav-link">Smartphones</a>
            <a href="/products/laptops" class="nav-link">Laptops</a>
            <a href="/products/tablets" class="nav-link">Tablets</a>
            <a href="/products/accessories" class="nav-link">Accessories</a>
            <a href="/help" class="nav-link">Help Center</a>
            <a href="/cart" class="nav-link cart-link">Cart (<span id="cart-count">0</span>)</a>
          </nav>
        </div>
      </header>

      <main class="main">
        <section class="hero">
          <div class="container">
            <h2>🚀 LIVE DEMO - Premium Technology Devices</h2>
            <p>🎯 CI/CD Pipeline Demo - Latest smartphones, laptops, tablets, and accessories</p>
          </div>
        </section>

        <section class="products">
          <div class="container">
            <h3>Featured Products</h3>
            <div class="product-grid" id="product-grid">
              <!-- Products will be loaded here -->
            </div>
          </div>
        </section>
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 TechStore - Group Melvin Final | SWE40006</p>
        </div>
      </footer>

      <script>
        // Load products
        async function loadProducts() {
          try {
            const response = await fetch('/api/products');
            const products = await response.json();
            displayProducts(products);
          } catch (error) {
            console.error('Error loading products:', error);
          }
        }

        function displayProducts(products) {
          const grid = document.getElementById('product-grid');
          grid.innerHTML = products.map(product => \`
            <div class="product-card">
              <img src="\${product.image}" alt="\${product.name}" class="product-image" onerror="this.src='/images/placeholder.jpg'">
              <div class="product-info">
                <h4 class="product-name">\${product.name}</h4>
                <p class="product-description">\${product.description}</p>
                <div class="product-price">$\${product.price}</div>
                <button class="btn btn-primary" onclick="addToCart(\${product.id})">Add to Cart</button>
                <a href="/product/\${product.id}" class="btn btn-secondary">View Details</a>
              </div>
            </div>
          \`).join('');
        }

        async function addToCart(productId) {
          try {
            const response = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, quantity: 1 })
            });
            
            if (response.ok) {
              updateCartCount();
              alert('Product added to cart!');
            }
          } catch (error) {
            console.error('Error adding to cart:', error);
          }
        }

        async function updateCartCount() {
          try {
            const response = await fetch('/api/cart');
            const cart = await response.json();
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            document.getElementById('cart-count').textContent = count;
          } catch (error) {
            console.error('Error updating cart count:', error);
          }
        }

        // Load products on page load
        loadProducts();
        updateCartCount();
      </script>
    </body>
    </html>
  `;
  res.send(ecommerceHtml);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Product API endpoints
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filteredProducts = products;

  if (category) {
    filteredProducts = products.filter(p => p.category === category);
  }

  if (search) {
    const searchTerm = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm)
    );
  }

  res.json(filteredProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Cart API endpoints
app.get('/api/cart', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const cart = carts.get(sessionId) || [];
  res.json(cart);
});

app.post('/api/cart', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const { productId, quantity = 1 } = req.body;
  
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  let cart = carts.get(sessionId) || [];
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
  }

  carts.set(sessionId, cart);
  res.json({ success: true, cart });
});

app.delete('/api/cart/:productId', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const productId = parseInt(req.params.productId);
  
  let cart = carts.get(sessionId) || [];
  cart = cart.filter(item => item.productId !== productId);
  
  carts.set(sessionId, cart);
  res.json({ success: true, cart });
});

// Product category pages
app.get('/products/:category', (req, res) => {
  const { category } = req.params;
  const categoryProducts = products.filter(p => p.category === category);
  
  const categoryHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${category.charAt(0).toUpperCase() + category.slice(1)} - TechStore</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <header class="header">
        <div class="container">
          <h1 class="logo"><a href="/">TechStore</a></h1>
          <nav class="nav">
            <a href="/" class="nav-link">Home</a>
            <a href="/products/smartphones" class="nav-link ${category === 'smartphones' ? 'active' : ''}">Smartphones</a>
            <a href="/products/laptops" class="nav-link ${category === 'laptops' ? 'active' : ''}">Laptops</a>
            <a href="/products/tablets" class="nav-link ${category === 'tablets' ? 'active' : ''}">Tablets</a>
            <a href="/products/accessories" class="nav-link ${category === 'accessories' ? 'active' : ''}">Accessories</a>
            <a href="/help" class="nav-link">Help Center</a>
            <a href="/cart" class="nav-link cart-link">Cart (<span id="cart-count">0</span>)</a>
          </nav>
        </div>
      </header>

      <main class="main">
        <section class="products">
          <div class="container">
            <h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            <div class="product-grid">
              ${categoryProducts.map(product => `
                <div class="product-card">
                  <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='/images/placeholder.jpg'">
                  <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price}</div>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                    <a href="/product/${product.id}" class="btn btn-secondary">View Details</a>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 TechStore - Group Melvin Final | SWE40006</p>
        </div>
      </footer>

      <script>
        async function addToCart(productId) {
          try {
            const response = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, quantity: 1 })
            });
            
            if (response.ok) {
              updateCartCount();
              alert('Product added to cart!');
            }
          } catch (error) {
            console.error('Error adding to cart:', error);
          }
        }

        async function updateCartCount() {
          try {
            const response = await fetch('/api/cart');
            const cart = await response.json();
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            document.getElementById('cart-count').textContent = count;
          } catch (error) {
            console.error('Error updating cart count:', error);
          }
        }

        updateCartCount();
      </script>
    </body>
    </html>
  `;
  res.send(categoryHtml);
});

// Individual product detail page
app.get('/product/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).send('<h1>Product not found</h1>');
  }

  const productDetailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${product.name} - TechStore</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <header class="header">
        <div class="container">
          <h1 class="logo"><a href="/">TechStore</a></h1>
          <nav class="nav">
            <a href="/" class="nav-link">Home</a>
            <a href="/products/smartphones" class="nav-link">Smartphones</a>
            <a href="/products/laptops" class="nav-link">Laptops</a>
            <a href="/products/tablets" class="nav-link">Tablets</a>
            <a href="/products/accessories" class="nav-link">Accessories</a>
            <a href="/help" class="nav-link">Help Center</a>
            <a href="/cart" class="nav-link cart-link">Cart (<span id="cart-count">0</span>)</a>
          </nav>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="product-detail">
            <div class="product-image-large">
              <img src="${product.image}" alt="${product.name}" onerror="this.src='/images/placeholder.jpg'">
            </div>
            <div class="product-info-detail">
              <h1>${product.name}</h1>
              <p class="product-description-detail">${product.description}</p>
              <div class="product-price-large">$${product.price}</div>
              
              <div class="product-actions">
                <button class="btn btn-primary btn-large" onclick="addToCart(${product.id})">Add to Cart</button>
                <button class="btn btn-secondary btn-large" onclick="buyNow(${product.id})">Buy Now</button>
              </div>

              <div class="specifications">
                <h3>Specifications</h3>
                <div class="spec-list">
                  ${Object.entries(product.specifications).map(([key, value]) => `
                    <div class="spec-item">
                      <span class="spec-label">${key}:</span>
                      <span class="spec-value">${value}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 TechStore - Group Melvin Final | SWE40006</p>
        </div>
      </footer>

      <script>
        async function addToCart(productId) {
          try {
            const response = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, quantity: 1 })
            });
            
            if (response.ok) {
              updateCartCount();
              alert('Product added to cart!');
            }
          } catch (error) {
            console.error('Error adding to cart:', error);
          }
        }

        function buyNow(productId) {
          addToCart(productId).then(() => {
            window.location.href = '/cart';
          });
        }

        async function updateCartCount() {
          try {
            const response = await fetch('/api/cart');
            const cart = await response.json();
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            document.getElementById('cart-count').textContent = count;
          } catch (error) {
            console.error('Error updating cart count:', error);
          }
        }

        updateCartCount();
      </script>
    </body>
    </html>
  `;
  res.send(productDetailHtml);
});

// Shopping cart page
app.get('/cart', (req, res) => {
  const cartHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shopping Cart - TechStore</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <header class="header">
        <div class="container">
          <h1 class="logo"><a href="/">TechStore</a></h1>
          <nav class="nav">
            <a href="/" class="nav-link">Home</a>
            <a href="/products/smartphones" class="nav-link">Smartphones</a>
            <a href="/products/laptops" class="nav-link">Laptops</a>
            <a href="/products/tablets" class="nav-link">Tablets</a>
            <a href="/products/accessories" class="nav-link">Accessories</a>
            <a href="/help" class="nav-link">Help Center</a>
            <a href="/cart" class="nav-link cart-link active">Cart (<span id="cart-count">0</span>)</a>
          </nav>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <h2>Shopping Cart</h2>
          <div id="cart-content">
            <!-- Cart items will be loaded here -->
          </div>
          <div class="cart-summary" id="cart-summary" style="display: none;">
            <div class="total">
              <strong>Total: $<span id="cart-total">0</span></strong>
            </div>
            <button class="btn btn-primary btn-large" onclick="checkout()">Proceed to Checkout</button>
          </div>
          <div id="empty-cart" style="display: none;">
            <p>Your cart is empty. <a href="/">Continue shopping</a></p>
          </div>
        </div>
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 TechStore - Group Melvin Final | SWE40006</p>
        </div>
      </footer>

      <script>
        async function loadCart() {
          try {
            const response = await fetch('/api/cart');
            const cart = await response.json();
            displayCart(cart);
          } catch (error) {
            console.error('Error loading cart:', error);
          }
        }

        function displayCart(cart) {
          const cartContent = document.getElementById('cart-content');
          const cartSummary = document.getElementById('cart-summary');
          const emptyCart = document.getElementById('empty-cart');
          
          if (cart.length === 0) {
            cartContent.innerHTML = '';
            cartSummary.style.display = 'none';
            emptyCart.style.display = 'block';
            document.getElementById('cart-count').textContent = '0';
            return;
          }

          emptyCart.style.display = 'none';
          cartSummary.style.display = 'block';

          cartContent.innerHTML = cart.map(item => \`
            <div class="cart-item">
              <img src="\${item.image}" alt="\${item.name}" class="cart-item-image" onerror="this.src='/images/placeholder.jpg'">
              <div class="cart-item-info">
                <h4>\${item.name}</h4>
                <div class="cart-item-price">$\${item.price}</div>
              </div>
              <div class="cart-item-quantity">
                <label>Qty: \${item.quantity}</label>
              </div>
              <div class="cart-item-total">
                $\${(item.price * item.quantity).toFixed(2)}
              </div>
              <button class="btn btn-danger" onclick="removeFromCart(\${item.productId})">Remove</button>
            </div>
          \`).join('');

          const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const count = cart.reduce((total, item) => total + item.quantity, 0);
          
          document.getElementById('cart-total').textContent = total.toFixed(2);
          document.getElementById('cart-count').textContent = count;
        }

        async function removeFromCart(productId) {
          try {
            const response = await fetch(\`/api/cart/\${productId}\`, {
              method: 'DELETE'
            });
            
            if (response.ok) {
              loadCart();
            }
          } catch (error) {
            console.error('Error removing from cart:', error);
          }
        }

        function checkout() {
          alert('Checkout functionality would be implemented here!');
        }

        loadCart();
      </script>
    </body>
    </html>
  `;
  res.send(cartHtml);
});

// Help Center page
app.get('/help', (req, res) => {
  const helpCenterHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Help Center - TechStore</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <header class="header">
        <div class="container">
          <h1 class="logo"><a href="/">TechStore</a></h1>
          <nav class="nav">
            <a href="/" class="nav-link">Home</a>
            <a href="/products/smartphones" class="nav-link">Smartphones</a>
            <a href="/products/laptops" class="nav-link">Laptops</a>
            <a href="/products/tablets" class="nav-link">Tablets</a>
            <a href="/products/accessories" class="nav-link">Accessories</a>
            <a href="/help" class="nav-link active">Help Center</a>
            <a href="/cart" class="nav-link cart-link">Cart (<span id="cart-count">0</span>)</a>
          </nav>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="help-center">
            <h1 class="help-title">Help Center</h1>
            <p class="help-subtitle">Find answers to frequently asked questions and get support</p>

            <!-- Quick Help Categories -->
            <div class="help-categories">
              <div class="help-category-card" onclick="showSection('orders')">
                <div class="help-icon">📦</div>
                <h3>Orders & Shipping</h3>
                <p>Track orders, shipping info, and delivery questions</p>
              </div>
              <div class="help-category-card" onclick="showSection('returns')">
                <div class="help-icon">↩️</div>
                <h3>Returns & Refunds</h3>
                <p>Return policy, refund process, and exchanges</p>
              </div>
              <div class="help-category-card" onclick="showSection('products')">
                <div class="help-icon">💻</div>
                <h3>Product Support</h3>
                <p>Technical support and product information</p>
              </div>
              <div class="help-category-card" onclick="showSection('account')">
                <div class="help-icon">👤</div>
                <h3>Account & Payment</h3>
                <p>Account issues and payment methods</p>
              </div>
            </div>

            <!-- FAQ Sections -->
            <div id="orders" class="faq-section">
              <h2>Orders & Shipping</h2>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>How can I track my order?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>Once your order ships, you'll receive a tracking number via email. You can use this number to track your package on our shipping partner's website. Orders typically arrive within 3-7 business days.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>What are your shipping options?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>We offer free standard shipping (5-7 days), expedited shipping (2-3 days) for $9.99, and overnight shipping for $19.99. Free shipping is available on orders over $50.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>Can I change or cancel my order?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>You can modify or cancel your order within 1 hour of placing it. After that, the order enters our fulfillment process and cannot be changed. Please contact customer service immediately if you need assistance.</p>
                </div>
              </div>
            </div>

            <div id="returns" class="faq-section" style="display: none;">
              <h2>Returns & Refunds</h2>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>What is your return policy?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>We offer a 30-day return policy for most items. Products must be in original condition with all accessories and packaging. Electronics have a 14-day return window due to hygiene and security reasons.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>How do I return an item?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>Contact our customer service to initiate a return. We'll provide you with a prepaid return label and instructions. Once we receive and inspect the item, your refund will be processed within 5-7 business days.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>When will I receive my refund?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>Refunds are processed within 5-7 business days after we receive your returned item. The refund will appear on your original payment method within 1-2 billing cycles depending on your bank or credit card company.</p>
                </div>
              </div>
            </div>

            <div id="products" class="faq-section" style="display: none;">
              <h2>Product Support</h2>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>Are your products authentic and new?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>Yes, all our products are 100% authentic and brand new. We work directly with authorized distributors and manufacturers to ensure authenticity and quality. All items come with manufacturer warranties.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>Do you offer technical support?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>We provide basic setup guidance and troubleshooting. For detailed technical support, please contact the manufacturer directly using the warranty information included with your product.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>What if my product arrives damaged?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>If your product arrives damaged, please contact us within 48 hours with photos of the damage. We'll arrange for a replacement or full refund immediately. We package all items carefully, but shipping damage can occasionally occur.</p>
                </div>
              </div>
            </div>

            <div id="account" class="faq-section" style="display: none;">
              <h2>Account & Payment</h2>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>What payment methods do you accept?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely with SSL encryption.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>Is my payment information secure?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>Yes, we use industry-standard SSL encryption and comply with PCI DSS standards. Your payment information is never stored on our servers and is processed securely through our payment partners.</p>
                </div>
              </div>
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(this)">
                  <span>Do I need to create an account to purchase?</span>
                  <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                  <p>No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, view purchase history, and receive exclusive offers.</p>
                </div>
              </div>
            </div>

            <!-- Contact Section -->
            <div class="contact-section">
              <h2>Still Need Help?</h2>
              <p>Can't find what you're looking for? Our customer service team is here to help!</p>
              
              <div class="contact-methods">
                <div class="contact-method">
                  <div class="contact-icon">📧</div>
                  <h4>Email Support</h4>
                  <p>support@techstore.com</p>
                  <small>Response within 24 hours</small>
                </div>
                <div class="contact-method">
                  <div class="contact-icon">📞</div>
                  <h4>Phone Support</h4>
                  <p>1-800-TECH-HELP</p>
                  <small>Mon-Fri 9AM-6PM EST</small>
                </div>
                <div class="contact-method">
                  <div class="contact-icon">💬</div>
                  <h4>Live Chat</h4>
                  <p>Available on our website</p>
                  <small>Mon-Fri 9AM-9PM EST</small>
                </div>
              </div>

              <div class="contact-form">
                <h3>Send us a message</h3>
                <form onsubmit="submitContactForm(event)">
                  <div class="form-group">
                    <label for="name">Name *</label>
                    <input type="text" id="name" name="name" required>
                  </div>
                  <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                  </div>
                  <div class="form-group">
                    <label for="subject">Subject *</label>
                    <select id="subject" name="subject" required>
                      <option value="">Select a topic</option>
                      <option value="order">Order Question</option>
                      <option value="return">Return/Refund</option>
                      <option value="product">Product Support</option>
                      <option value="payment">Payment Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="message">Message *</label>
                    <textarea id="message" name="message" rows="4" required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 TechStore - Group Melvin Final | SWE40006</p>
        </div>
      </footer>

      <script>
        function showSection(sectionId) {
          // Hide all sections
          const sections = document.querySelectorAll('.faq-section');
          sections.forEach(section => section.style.display = 'none');
          
          // Show selected section
          document.getElementById(sectionId).style.display = 'block';
          
          // Scroll to section
          document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        }

        function toggleFAQ(element) {
          const faqItem = element.parentNode;
          const answer = faqItem.querySelector('.faq-answer');
          const icon = element.querySelector('.faq-icon');
          
          if (answer.style.display === 'block') {
            answer.style.display = 'none';
            icon.textContent = '+';
            faqItem.classList.remove('active');
          } else {
            answer.style.display = 'block';
            icon.textContent = '−';
            faqItem.classList.add('active');
          }
        }

        function submitContactForm(event) {
          event.preventDefault();
          alert('Thank you for your message! We will get back to you within 24 hours.');
          event.target.reset();
        }

        async function updateCartCount() {
          try {
            const response = await fetch('/api/cart');
            const cart = await response.json();
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            document.getElementById('cart-count').textContent = count;
          } catch (error) {
            console.error('Error updating cart count:', error);
          }
        }

        updateCartCount();
      </script>
    </body>
    </html>
  `;
  res.send(helpCenterHtml);
});

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, pong: Date.now() });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`Server starting on http://localhost:${port}`);
});