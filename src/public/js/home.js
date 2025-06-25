window.addEventListener('DOMContentLoaded', () => {
  // Get values from DOM
  const greenBits = parseInt(document.getElementById('greenBits')?.textContent) || 0;
  const streakCount = parseInt(document.getElementById('streakCount')?.textContent) || 0;
  const leaderboardPoints = parseInt(document.getElementById('leaderboardPoints')?.textContent) || 0;
  const carbonSaved = parseFloat(document.getElementById('carbonSaved')?.textContent) || 0;
  const wasteRecycled = parseFloat(document.getElementById('wasteRecycled')?.textContent) || 0;

  // Calculate total impact
  const totalImpact = carbonSaved + wasteRecycled;
  const totalImpactElem = document.getElementById('totalImpact');
  if (totalImpactElem) {
    totalImpactElem.textContent = totalImpact + ' kg';
  }

  // Calculate user level based on GreenBits
  let level = 'Beginner';
  if (greenBits > 1000) level = 'Eco Master';
  else if (greenBits > 500) level = 'Eco Pro';
  else if (greenBits > 100) level = 'Eco Enthusiast';

  // Show user level
  const userLevelElem = document.getElementById('userLevel');
  if (userLevelElem) {
    userLevelElem.innerHTML = `<strong>Level:</strong> ${level}`;
  }

  const wrapper = document.querySelector('.profile-photo-wrapper');
  const photoMenu = document.getElementById('photoMenu');
  const uploadInput = document.getElementById('profileUploadInput');
  const changeBtn = document.getElementById('changePhoto');
  const deleteBtn = document.getElementById('deletePhoto');
  const cancelBtn = document.getElementById('cancelMenu');
  const userId= wrapper?.getAttribute('data-user-id');
  wrapper?.addEventListener('click', () => {
    photoMenu.style.display = 'block';
  });
  cancelBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    photoMenu.style.display = 'none';
  });
  changeBtn?.addEventListener('click', () => {
    uploadInput?.click();
    photoMenu.style.display = 'none';
  });
  uploadInput?.addEventListener('change', async () => {
    const file = uploadInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    console.log('Uploading photo for user:', userId);
    try {
      const res = await fetch(`/users/${userId}/photo`, {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        location.reload();
      } else {
        alert(data.message || 'Upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Network error.');
    }
  });
  deleteBtn?.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to delete your profile photo?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/users/${userId}/photo`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        location.reload();
      } else {
        alert(data.message || 'Deletion failed.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error.');
    }
  });

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  }

  document.querySelectorAll('.add-cart-btn').forEach(button => {
    button.addEventListener('click', () => {
      const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: parseInt(button.dataset.price)
      };
      addToCart(product);
    });
  });

});