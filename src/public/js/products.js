document.addEventListener('DOMContentLoaded', function() {
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
            shareOptions.style.display = shareOptions.style.display === 'block' ? 'none' : 'block';
        });
    });
    document.addEventListener('click', function() {
        document.querySelectorAll('.share-options').forEach(option => {
            option.style.display = 'none';
        });
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
}