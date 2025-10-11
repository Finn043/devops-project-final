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
    price: 999,
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
            <a href="/cart" class="nav-link cart-link">Cart (<span id="cart-count">0</span>)</a>
          </nav>
        </div>
      </header>

      <main class="main">
        <section class="hero">
          <div class="container">
            <h2>Premium Technology Devices</h2>
            <p>Discover the latest smartphones, laptops, tablets, and accessories</p>
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