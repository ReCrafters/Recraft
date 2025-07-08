document.addEventListener('DOMContentLoaded', function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const cartCountElement = document.getElementById('cart-count');
    
    function updateCartCount() {
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    }
    
    function showFlashMessage(type, message, action = null) {
        const existingAlerts = document.querySelectorAll('.custom-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        const alert = document.createElement('div');
        alert.className = `custom-alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <span class="alert-message">${message}</span>
                ${action ? `<a href="${action.url}" class="alert-action">${action.text}</a>` : ''}
                <button class="alert-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('show');
        }, 10);
        
        const dismissTimer = setTimeout(() => {
            dismissAlert(alert);
        }, 5000);
        
        alert.querySelector('.alert-close').addEventListener('click', () => {
            clearTimeout(dismissTimer);
            dismissAlert(alert);
        });
    }
    
    function dismissAlert(alert) {
        alert.classList.remove('show');
        setTimeout(() => {
            alert.remove();
        }, 300);
    }
    
    function addToCart(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += product.quantity;
        } else {
            cart.push(product);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        showFlashMessage('success', `${product.name} added to cart!`, {
            text: 'View Cart',
            url: '/cart'
        });
    }
    
    updateCartCount();
    
    document.querySelectorAll('.add-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const product = {
                id: button.dataset.id,
                name: button.dataset.name,
                price: parseFloat(button.dataset.price),
                image: button.dataset.image,
                quantity: 1
            };
            addToCart(product);
        });
    });
    document.querySelectorAll('.image-nav').forEach(nav => {
        nav.addEventListener('click', function(e) {
            e.stopPropagation();
            const container = this.closest('.product-image-container');
            const img = container.querySelector('.product-image');
            const currentSrc = img.src;
            const images = JSON.parse(container.dataset.images || '[]');
            
            if (images.length > 1) {
                let currentIndex = images.indexOf(currentSrc);
                if (this.classList.contains('left')) {
                    currentIndex = (currentIndex - 1 + images.length) % images.length;
                } else {
                    currentIndex = (currentIndex + 1) % images.length;
                }
                img.src = images[currentIndex];
            }
        });
    });
    
    document.querySelectorAll('.product-image-container').forEach(container => {
        const productCard = container.closest('.product-card');
        const productId = productCard.querySelector('.add-cart-btn').dataset.id;
        const product = products.find(p => p._id === productId);
        if (product && product.images && product.images.length > 1) {
            container.dataset.images = JSON.stringify(product.images);
        }
    });
    
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const shareOptions = this.querySelector('.share-options');
            const isVisible = shareOptions.style.display === 'block';
            
            document.querySelectorAll('.share-options').forEach(option => {
                option.style.display = 'none';
            });
            shareOptions.style.display = isVisible ? 'none' : 'block';
        });
    });
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.share-btn') && !e.target.closest('.share-options')) {
            document.querySelectorAll('.share-options').forEach(option => {
                option.style.display = 'none';
            });
        }
    });
    document.querySelectorAll('.quantity-control').forEach(control => {
        const input = control.querySelector('.quantity-input');
        const minus = control.querySelector('.quantity-minus');
        const plus = control.querySelector('.quantity-plus');
        
        if (minus && plus && input) {
            minus.addEventListener('click', () => {
                let value = parseInt(input.value) || 1;
                if (value > 1) {
                    input.value = value - 1;
                }
            });
            
            plus.addEventListener('click', () => {
                let value = parseInt(input.value) || 1;
                input.value = value + 1;
            });
            
            input.addEventListener('change', () => {
                let value = parseInt(input.value) || 1;
                if (value < 1) input.value = 1;
                if (value > 100) input.value = 100;
            });
        }
    });
});

function shareProduct(productId, platform) {
    const productUrl = window.location.origin + '/products/' + productId;
    let shareUrl;
    
    switch(platform) {
        case 'facebook':
            shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(productUrl);
            break;
        case 'twitter':
            shareUrl = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(productUrl);
            break;
        case 'whatsapp':
            shareUrl = 'https://wa.me/?text=' + encodeURIComponent('Check out this eco-friendly product: ' + productUrl);
            break;
        default:
            shareUrl = productUrl;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    document.querySelectorAll('.share-options').forEach(option => {
        option.style.display = 'none';
    });
}