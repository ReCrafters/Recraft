const cartItemsDiv = document.getElementById('cart-items');
const userId = cartItemsDiv.dataset.user;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function displayCart() {
  cartItemsDiv.innerHTML = '';
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  cart.forEach(item => {
    cartItemsDiv.innerHTML += `
      <div style="margin-bottom: 10px;">
        <strong>${item.name}</strong> - ₹${item.price} × ${item.quantity}
        <button onclick="removeFromCart('${item.id}')">❌ Remove</button>
      </div>
    `;
  });
}
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  displayCart();
}
function syncCart() {
  if (!userId) {
    alert('Please log in to sync your cart.');
    return;
  }
  fetch('/cart/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, cart })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || 'Cart synced successfully!');
    })
    .catch(err => {
      console.error('Cart sync failed:', err);
      alert('Failed to sync cart. Try again later.');
    });
}

window.onload = () => {
  displayCart();
};
