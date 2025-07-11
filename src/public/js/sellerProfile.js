document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const DOM = {
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        tabIndicator: document.querySelector('.tab-indicator'),
        statItems: document.querySelectorAll('.stat-item[data-target]'),
        modals: {
            editProfile: document.getElementById('editProfileModal'),
            follow: document.getElementById('followModal'),
            post: document.getElementById('postModal'),
            product: document.getElementById('productModal')
        },
        buttons: {
            editProfile: document.getElementById('editProfileBtn'),
            moreOptions: document.getElementById('moreOptionsBtn'),
            createFirstProduct: document.getElementById('createFirstProductBtn'),
            createFirstPost: document.getElementById('createFirstPostBtn'),
            explorePosts: document.getElementById('explorePostsBtn')
        }
    };
    
    const state = {
        currentPost: null,
        currentProduct: null,
        currentSlideIndex: 0,
        mediaSlides: []
    };

    // Flash Messages System
    function clearFlashMessages() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        });
    }

    function showFlashMessage(type, message) {
        clearFlashMessages();
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'error' ? 'danger' : 'success'}`;
        alert.setAttribute('role', 'alert');
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.left = '50%';
        alert.style.transform = 'translateX(-50%)';
        alert.style.zIndex = '20000';
        
        alert.innerHTML = `
            <button type="button" class="btn-close" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <p>${message}</p>
        `;
        
        document.body.appendChild(alert);
        
        // Add close functionality
        alert.querySelector('.btn-close').addEventListener('click', () => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }

    // Cart Management
    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        if (cartCountElements.length > 0) {
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElements.forEach(el => {
                el.textContent = count;
                el.style.display = count > 0 ? 'flex' : 'none';
            });
        }
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
        
        showFlashMessage('success', `${product.quantity} ${product.name} added to cart!`);
    }

    // Initialize quantity controls
    function initQuantityControls() {
        const quantityInput = document.getElementById('productQuantity');
        const minusBtn = document.getElementById('quantityMinus');
        const plusBtn = document.getElementById('quantityPlus');

        if (minusBtn && plusBtn && quantityInput) {
            minusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                if (value > 1) {
                    quantityInput.value = value - 1;
                }
            });

            plusBtn.addEventListener('click', () => {
                let value = parseInt(quantityInput.value);
                if (value < 100) {
                    quantityInput.value = value + 1;
                }
            });

            quantityInput.addEventListener('change', () => {
                let value = parseInt(quantityInput.value);
                if (isNaN(value) || value < 1) {
                    quantityInput.value = 1;
                } else if (value > 100) {
                    quantityInput.value = 100;
                }
            });
        }
    }

    // Tab System
    function initTabs() {
        const activeTab = document.querySelector('.tab.active');
        if (activeTab && DOM.tabIndicator) {
            DOM.tabIndicator.style.width = `${activeTab.offsetWidth}px`;
            DOM.tabIndicator.style.left = `${activeTab.offsetLeft}px`;
        }
        
        DOM.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                DOM.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                if (DOM.tabIndicator) {
                    DOM.tabIndicator.style.width = `${tab.offsetWidth}px`;
                    DOM.tabIndicator.style.left = `${tab.offsetLeft}px`;
                }
                
                const tabId = tab.getAttribute('data-tab') + 'Tab';
                DOM.tabContents.forEach(c => c.classList.remove('active'));
                document.getElementById(tabId)?.classList.add('active');
            });
        });
    }

    // Stat Items
    function initStatItems() {
        DOM.statItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-target');
                const tab = document.querySelector(`.tab[data-tab="${target}"]`);
                tab?.click();
                
                if (target === 'followers' || target === 'following') {
                    showFollowModal(target);
                }
            });
        });
    }

    // Modal System
    function initModals() {
        initEditProfileModal();
        initFollowModal();
        initPostModal();
        initProductModal();
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeAllModals();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    function closeAllModals() {
        Object.values(DOM.modals).forEach(modal => {
            if (modal) modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }

    // Follow System
    function initFollowButton() {
        const followBtn = document.getElementById('followBtn');
        if (!followBtn) return;
        
        const userId = followBtn.getAttribute('data-user-id');
        const isFollowing = followBtn.getAttribute('data-is-following') === 'true';
        
        updateFollowButton(followBtn, isFollowing);
        
        followBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`/users/${userId}/follow`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to update follow status');
                
                const data = await response.json();
                updateFollowButton(followBtn, data.isFollowing);
                followBtn.setAttribute('data-is-following', data.isFollowing);
                updateFollowerCount(data.followersCount);
                updateAllFollowButtons(userId, data.isFollowing);
                
                showFlashMessage('success', data.isFollowing ? 
                    `You are now following ${data.username}` : 
                    `You have unfollowed ${data.username}`);
            } catch (error) {
                console.error('Error:', error);
                showFlashMessage('error', 'Failed to update follow status');
            }
        });
    }

    function updateFollowButton(button, isFollowing) {
        button.classList.toggle('following', isFollowing);
        const followText = button.querySelector('.follow-text');
        const followingText = button.querySelector('.following-text');
        
        if (followText && followingText) {
            followText.style.display = isFollowing ? 'none' : 'block';
            followingText.style.display = isFollowing ? 'block' : 'none';
        } else {
            button.textContent = isFollowing ? 'Following' : 'Follow';
        }
    }

    function updateFollowerCount(count) {
        const followerCountElement = document.querySelector('.stat-item[data-target="followers"] .stat-number');
        if (followerCountElement) {
            followerCountElement.textContent = count;
        }
    }

    function updateAllFollowButtons(userId, isFollowing) {
        document.querySelectorAll(`[data-user-id="${userId}"]`).forEach(btn => {
            updateFollowButton(btn, isFollowing);
            btn.setAttribute('data-is-following', isFollowing);
        });
    }

    // Edit Profile Modal
    function initEditProfileModal() {
        const editProfileClose = document.getElementById('editProfileClose');
        const editProfileForm = document.getElementById('editProfileForm');
        const imagePreview = document.getElementById('imagePreview');
        const editImageInput = document.getElementById('editImage');
        
        if (DOM.buttons.editProfile) {
            DOM.buttons.editProfile.addEventListener('click', () => {
                DOM.modals.editProfile.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (editProfileClose) {
            editProfileClose.addEventListener('click', () => {
                DOM.modals.editProfile.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
        
        if (editImageInput && imagePreview) {
            editImageInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData();
                formData.append('name', document.getElementById('editName').value);
                formData.append('username', document.getElementById('editUsername').value);
                formData.append('bio', document.getElementById('editBio').value);
                formData.append('businessName', document.getElementById('editBusinessName').value);
                formData.append('businessType', document.getElementById('editBusinessType').value);
                
                if (editImageInput?.files[0]) {
                    formData.append('image', editImageInput.files[0]);
                }
                
                const userId = DOM.buttons.editProfile.getAttribute('data-user-id');
                
                try {
                    const response = await fetch(`/users/${userId}`, {
                        method: 'PUT',
                        body: formData
                    });
                    
                    const result = await response.json();
                    clearFlashMessages();
                    
                    if (!response.ok) {
                        showFlashMessage('error', result.error || 'Failed to update profile');
                        return;
                    }
                    
                    updateProfileUI(result.user);
                    DOM.modals.editProfile.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    showFlashMessage('success', result.message || 'Profile updated successfully');
                } catch(error) {
                    console.error('Error:', error);
                    clearFlashMessages();
                    showFlashMessage('error', 'Something went wrong. Please try again.');
                }
            });
        }
    }

    function updateProfileUI(userData) {
        if (!userData) return;
        
        const elements = {
            name: document.querySelector('.profile-name'),
            username: document.querySelector('.profile-username'),
            bio: document.querySelector('.profile-bio'),
            avatar: document.querySelector('.profile-avatar'),
            businessName: document.querySelector('.profile-details .fa-store + span'),
            businessType: document.querySelector('.profile-details .fa-industry + span')
        };
        
        if (elements.name) elements.name.textContent = userData.name;
        if (elements.username) elements.username.textContent = `@${userData.username}`;
        if (elements.bio) elements.bio.textContent = userData.bio || 'No bio yet';
        if (elements.businessName) elements.businessName.textContent = userData.businessName;
        if (elements.businessType) elements.businessType.textContent = userData.businessType;
        
        if (userData.image && elements.avatar) {
            if (elements.avatar.classList.contains('default-avatar')) {
                elements.avatar.classList.remove('default-avatar');
                elements.avatar.innerHTML = '';
                elements.avatar.style.backgroundImage = `url(${userData.image})`;
                elements.avatar.style.backgroundSize = 'cover';
            } else {
                elements.avatar.src = userData.image;
            }
        }
    }

    // Follow Modal
    function initFollowModal() {
        const followModalClose = document.getElementById('followModalClose');
        const followTabs = document.querySelectorAll('.follow-tab');
        const followSections = {
            followers: document.getElementById('followersSection'),
            following: document.getElementById('followingSection')
        };
        
        if (followModalClose) {
            followModalClose.addEventListener('click', () => {
                DOM.modals.follow.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
        
        followTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const type = tab.getAttribute('data-type');
                showFollowModal(type);
            });
        });
        
        document.addEventListener('click', async function(e) {
            const followBtn = e.target.closest('.follow-user-btn');
            if (!followBtn) return;
            
            const userId = followBtn.getAttribute('data-user-id');
            const isFollowing = followBtn.getAttribute('data-is-following') === 'true';
            
            try {
                const response = await fetch(`/users/${userId}/follow`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (!response.ok) throw new Error('Failed to update follow status');
                
                const data = await response.json();
                updateFollowButton(followBtn, data.isFollowing);
                followBtn.setAttribute('data-is-following', data.isFollowing);
                
                const mainFollowBtn = document.getElementById('followBtn');
                if (mainFollowBtn?.getAttribute('data-user-id') === userId) {
                    updateFollowButton(mainFollowBtn, data.isFollowing);
                    mainFollowBtn.setAttribute('data-is-following', data.isFollowing);
                }
                
                if (followBtn.closest('#followersSection')) {
                    updateFollowerCount(data.followersCount);
                }
                
                showFlashMessage('success', data.isFollowing ? 
                    `You are now following ${data.username}` : 
                    `You have unfollowed ${data.username}`);
            } catch (error) {
                console.error('Error:', error);
                showFlashMessage('error', 'Failed to update follow status');
            }
        });
    }

    function showFollowModal(type) {
        document.getElementById('followModalTitle').textContent = 
            type === 'followers' ? 'Followers' : 'Following';
        
        DOM.modals.follow.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        document.querySelectorAll('.follow-section').forEach(section => {
            section.style.display = 'none';
        });
        
        document.getElementById(`${type}Section`).style.display = 'block';
        
        document.querySelectorAll('.follow-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-type') === type);
        });
    }

    // Post Modal
    function initPostModal() {
        const postMediaSliderTrack = document.getElementById('postMediaSliderTrack');
        const postPrevButton = document.getElementById('postPrevButton');
        const postNextButton = document.getElementById('postNextButton');
        const postModalClose = document.getElementById('postModalClose');
        
        document.addEventListener('click', async (e) => {
            const postItem = e.target.closest('.post-item');
            if (postItem) {
                const postId = postItem.getAttribute('data-post-id');
                await loadPostModal(postId);
            }
        });
        
        if (postPrevButton) postPrevButton.addEventListener('click', showPrevSlide);
        if (postNextButton) postNextButton.addEventListener('click', showNextSlide);
        
        document.addEventListener('keydown', (e) => {
            if (!DOM.modals.post.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') showPrevSlide();
            else if (e.key === 'ArrowRight') showNextSlide();
        });
        
        if (postModalClose) {
            postModalClose.addEventListener('click', () => {
                DOM.modals.post.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
        
        async function loadPostModal(postId) {
            try {
                document.getElementById('modalPostTitle').textContent = 'Loading...';
                DOM.modals.post.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                const response = await fetch(`/posts/${postId}`);
                if (!response.ok) throw new Error('Failed to fetch post');
                
                state.currentPost = await response.json();
                state.currentSlideIndex = 0;
                initMediaSlider(state.currentPost.media, 'post');
                updatePostInfo(state.currentPost);
            } catch (error) {
                console.error('Error loading post:', error);
                showModalError('post');
            }
        }
        
        function updatePostInfo(post) {
            const setTextContent = (id, text) => {
                const el = document.getElementById(id);
                if (el) el.textContent = text;
            };
            
            const fields = {
                'modalPostTitle': post.caption || 'Post',
                'modalDescription': post.description || post.caption || 'No description available',
                'modalViews': post.views || 0,
                'modalLikes': post.likes?.length || 0,
                'modalComments': post.comments?.length || 0,
                'modalDate': post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '',
                'modalMaterialType': post.materialType || '',
                'modalCategory': post.category || ''
            };
            
            Object.entries(fields).forEach(([id, text]) => setTextContent(id, text));
        }
    }

    // Product Modal
    function initProductModal() {
        const productMediaSliderTrack = document.getElementById('productMediaSliderTrack');
        const productPrevButton = document.getElementById('productPrevButton');
        const productNextButton = document.getElementById('productNextButton');
        const productModalClose = document.getElementById('productModalClose');
        const editProductBtn = document.getElementById('editProductBtn');
        const deleteProductBtn = document.getElementById('deleteProductBtn');
        const addToCartBtn = document.getElementById('addToCartBtn');
        const buyNowBtn = document.getElementById('buyNowBtn');
        
        document.addEventListener('click', async (e) => {
            const productItem = e.target.closest('.product-item');
            if (productItem) {
                const productId = productItem.getAttribute('data-product-id');
                await loadProductModal(productId);
            }
        });
        
        if (productPrevButton) productPrevButton.addEventListener('click', showPrevSlide);
        if (productNextButton) productNextButton.addEventListener('click', showNextSlide);
        
        document.addEventListener('keydown', (e) => {
            if (!DOM.modals.product.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') showPrevSlide();
            else if (e.key === 'ArrowRight') showNextSlide();
        });
        
        if (productModalClose) {
            productModalClose.addEventListener('click', () => {
                DOM.modals.product.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
        
        if (editProductBtn) {
            editProductBtn.addEventListener('click', () => {
                if (state.currentProduct) {
                    window.location.href = `/products/${state.currentProduct._id}/edit`;
                }
            });
        }
        
        if (deleteProductBtn) {
            deleteProductBtn.addEventListener('click', async () => {
                if (state.currentProduct && confirm('Are you sure you want to delete this product?')) {
                    try {
                        const response = await fetch(`/products/${state.currentProduct._id}`, {
                            method: 'DELETE'
                        });
                        
                        if (response.ok) {
                            showFlashMessage('success', 'Product deleted successfully');
                            setTimeout(() => window.location.reload(), 1000);
                        } else {
                            throw new Error('Failed to delete product');
                        }
                    } catch (error) {
                        console.error('Error deleting product:', error);
                        showFlashMessage('error', 'Failed to delete product');
                    }
                }
            });
        }
        
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                if (state.currentProduct) {
                    const quantity = parseInt(document.getElementById('productQuantity')?.value) || 1;
                    const product = {
                        id: state.currentProduct._id,
                        name: state.currentProduct.name,
                        price: state.currentProduct.price,
                        image: state.currentProduct.images[0],
                        quantity: quantity
                    };
                    addToCart(product);
                }
            });
        }
        
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                if (state.currentProduct) {
                    const quantity = parseInt(document.getElementById('productQuantity')?.value) || 1;
                    const product = {
                        id: state.currentProduct._id,
                        name: state.currentProduct.name,
                        price: state.currentProduct.price,
                        image: state.currentProduct.images[0],
                        quantity: quantity
                    };
                    addToCart(product);
                    window.location.href = '/checkout';
                }
            });
        }
        
        async function loadProductModal(productId) {
            try {
                document.getElementById('modalProductTitle').textContent = 'Loading...';
                DOM.modals.product.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                const response = await fetch(`/products/${productId}/info`);
                if (!response.ok) throw new Error('Failed to fetch product');
                
                state.currentProduct = await response.json();
                state.currentSlideIndex = 0;
                initMediaSlider(state.currentProduct.images, 'product');
                updateProductInfo(state.currentProduct);
                initQuantityControls();
                
                // Update add to cart button data attributes
                if (addToCartBtn) {
                    addToCartBtn.dataset.id = state.currentProduct._id;
                    addToCartBtn.dataset.name = state.currentProduct.name;
                    addToCartBtn.dataset.price = state.currentProduct.price;
                    addToCartBtn.dataset.image = state.currentProduct.images[0];
                }
            } catch (error) {
                console.error('Error loading product:', error);
                showModalError('product');
            }
        }
        
        function updateProductInfo(product) {
            const setTextContent = (id, text) => {
                const el = document.getElementById(id);
                if (el) el.textContent = text;
            };
            
            const fields = {
                'modalProductTitle': product.name,
                'modalProductDescription': product.description || 'No description available',
                'modalProductViews': product.views || 0,
                'modalProductPurchases': product.purchases || 0,
                'modalProductRating': product.rating?.avgRating || 0,
                'modalProductDate': product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '',
                'modalProductCategory': product.category || '',
                'modalProductStock': product.stock || 0,
                'modalProductPrice': product.price ? `₹${product.price.toFixed(2)}` : '₹0.00'
            };
            
            Object.entries(fields).forEach(([id, text]) => setTextContent(id, text));
        }
    }

    // Media Slider Functions
    function initMediaSlider(mediaArray, type) {
        const sliderTrack = type === 'product' ? 
            document.getElementById('productMediaSliderTrack') : 
            document.getElementById('postMediaSliderTrack');
            
        if (!sliderTrack) return;
        
        sliderTrack.innerHTML = '';
        state.mediaSlides = [];
        
        if (!mediaArray?.length) {
            showNoMediaPlaceholder(type);
            return;
        }
        
        mediaArray.forEach((media, index) => {
            const slide = document.createElement('div');
            slide.className = 'media-slide';
            
            const img = document.createElement('img');
            img.src = typeof media === 'string' ? media : media.url;
            img.alt = type === 'product' ? 
                `Product image ${index + 1}` : 
                `Post image ${index + 1}`;
            img.loading = 'lazy';
            
            slide.appendChild(img);
            sliderTrack.appendChild(slide);
            state.mediaSlides.push(slide);
        });
        
        updateSliderPosition();
        updateNavButtons(type);
    }

    function updateSliderPosition() {
        const slideWidth = 100;
        const sliderTrack = state.currentProduct ? 
            document.getElementById('productMediaSliderTrack') : 
            document.getElementById('postMediaSliderTrack');
            
        if (sliderTrack) {
            sliderTrack.style.transform = `translateX(-${state.currentSlideIndex * slideWidth}%)`;
        }
    }

    function updateNavButtons(type) {
        const mediaArray = type === 'product' ? 
            state.currentProduct?.images : 
            state.currentPost?.media;
            
        const prevButton = type === 'product' ? 
            document.getElementById('productPrevButton') : 
            document.getElementById('postPrevButton');
            
        const nextButton = type === 'product' ? 
            document.getElementById('productNextButton') : 
            document.getElementById('postNextButton');
        
        if (!mediaArray) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            return;
        }
        
        if (prevButton) prevButton.style.display = state.currentSlideIndex > 0 ? 'flex' : 'none';
        if (nextButton) nextButton.style.display = 
            state.currentSlideIndex < mediaArray.length - 1 ? 'flex' : 'none';
    }

    function showPrevSlide() {
        const mediaArray = state.currentProduct ? 
            state.currentProduct.images : 
            state.currentPost?.media;
            
        if (state.currentSlideIndex > 0) {
            state.currentSlideIndex--;
            updateSliderPosition();
            updateNavButtons(state.currentProduct ? 'product' : 'post');
        }
    }

    function showNextSlide() {
        const mediaArray = state.currentProduct ? 
            state.currentProduct.images : 
            state.currentPost?.media;
            
        if (mediaArray && state.currentSlideIndex < mediaArray.length - 1) {
            state.currentSlideIndex++;
            updateSliderPosition();
            updateNavButtons(state.currentProduct ? 'product' : 'post');
        }
    }

    function showModalError(type) {
        const setTextContent = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        
        if (type === 'product') {
            setTextContent('modalProductTitle', 'Error');
            setTextContent('modalProductDescription', 'Failed to load product. Please try again.');
        } else {
            setTextContent('modalPostTitle', 'Error');
            setTextContent('modalDescription', 'Failed to load post. Please try again.');
        }
    }

    function showNoMediaPlaceholder(type) {
        const sliderTrack = type === 'product' ? 
            document.getElementById('productMediaSliderTrack') : 
            document.getElementById('postMediaSliderTrack');
            
        if (sliderTrack) {
            sliderTrack.innerHTML = `
                <div class="no-media">
                    <i class="fas fa-image"></i>
                    <p>No media available</p>
                </div>
            `;
            updateNavButtons(type);
        }
    }

    // Initialize buttons
    if (DOM.buttons.createFirstProduct) {
        DOM.buttons.createFirstProduct.addEventListener('click', () => {
            window.location.href = '/products/new';
        });
    }
    
    if (DOM.buttons.createFirstPost) {
        DOM.buttons.createFirstPost.addEventListener('click', () => {
            window.location.href = '/posts/new';
        });
    }
    
    if (DOM.buttons.explorePosts) {
        DOM.buttons.explorePosts.addEventListener('click', () => {
            window.location.href = '/posts';
        });
    }

    // Initialize all components
    initTabs();
    initStatItems();
    initModals();
    initFollowButton();
    updateCartCount();
});