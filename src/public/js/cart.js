const cartItemsDiv = document.getElementById('cart-items');
const cartSummaryDiv = document.getElementById('cart-summary');
const checkoutBtn = document.getElementById('checkout-btn');
const userId = cartItemsDiv.dataset.user;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-block' : 'none';
  });
}

function displayCart() {
  cartItemsDiv.innerHTML = '';
  
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
        <a href="/" class="continue-shopping">Continue Shopping</a>
      </div>
    `;
    cartSummaryDiv.style.display = 'none';
    return;
  }
  
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    cartItemsDiv.innerHTML += `
      <div class="cart-item" data-id="${item.id}">
        <div class="item-clickable" onclick="redirectToProduct('${item.id}')">
          ${item.image ? `
            <img src="${item.image}" 
                 alt="${item.name}" 
                 class="item-image"
                 onerror="this.remove()">` : ''
          }
          <div class="item-details">
            <h3 class="item-name">${item.name}</h3>
            <p class="item-price">₹${item.price.toFixed(2)}</p>
          </div>
        </div>
        <div class="quantity-control">
          <button class="quantity-btn" onclick="event.stopPropagation(); updateQuantity('${item.id}', -1)">−</button>
          <input type="number" class="quantity-input" 
                 value="${item.quantity}" 
                 min="1" 
                 onchange="updateQuantityInput('${item.id}', this.value)"
                 onclick="event.stopPropagation()">
          <button class="quantity-btn" onclick="event.stopPropagation(); updateQuantity('${item.id}', 1)">+</button>
        </div>
        <button class="remove-btn" onclick="event.stopPropagation(); removeFromCart('${item.id}')">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  });
  
  document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('total').textContent = `₹${subtotal.toFixed(2)}`;
  cartSummaryDiv.style.display = 'block';
}

function redirectToProduct(productId) {
  window.location.href = `/products/${productId}`;
}

function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity = Math.max(1, item.quantity + change);
    saveCart();
    displayCart();
  }
}

function updateQuantityInput(id, value) {
  const quantity = parseInt(value);
  if (!isNaN(quantity)) {
    const item = cart.find(item => item.id === id);
    if (item && quantity >= 1) {
      item.quantity = quantity;
      saveCart();
      displayCart();
      if (userId) syncCart();
    }
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  displayCart();
}

// Event delegation for dynamically added elements
document.addEventListener('click', function(e) {
  if (e.target.closest('.item-clickable')) {
    const cartItem = e.target.closest('.cart-item');
    if (cartItem) {
      redirectToProduct(cartItem.dataset.id);
    }
  }
});

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (!userId) {
      const notification = document.createElement('div');
      notification.className = 'notification info';
      notification.textContent = 'Please log in to complete your purchase';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
    window.location.href= '/order/checkout';
  });
}

// Make functions available globally
window.updateQuantity = updateQuantity;
window.updateQuantityInput = updateQuantityInput;
window.removeFromCart = removeFromCart;
window.redirectToProduct = redirectToProduct;

// Initialize cart
window.onload = () => {
  displayCart();
  updateCartCount();
};

