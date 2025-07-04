document.addEventListener('DOMContentLoaded', function() {
    const DOM = {
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        tabIndicator: document.querySelector('.tab-indicator'),
        statItems: document.querySelectorAll('.stat-item[data-target]'),
        modals: {
            editProfile: document.getElementById('editProfileModal'),
            follow: document.getElementById('followModal'),
            post: document.getElementById('postModal')
        },
        buttons: {
            editProfile: document.getElementById('editProfileBtn'),
            moreOptions: document.getElementById('moreOptionsBtn')
        }
    };
    const state = {
        currentPost: null,
        currentSlideIndex: 0,
        postSlides: []
    };
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
    function initStatItems() {
        DOM.statItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-target');
                const tab = document.querySelector(`.tab[data-tab="${target}"]`);
                tab?.click();
            });
        });
    }
    function initModals() {
        if (DOM.modals.editProfile) initEditProfileModal();
        if (DOM.modals.follow) initFollowModal();
        if (DOM.modals.post) initPostModal();
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
            } catch (error) {
                console.error('Error:', error);
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
                const editBtn= document.getElementById('editProfileBtn')
                if (editImageInput?.files[0]) {
                    formData.append('image', editImageInput.files[0]);
                }
                const userId = editBtn.getAttribute('data-user-id');
                try {
                    const response = await fetch(`${userId}`, {
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
                    }catch(error) {
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
            avatar: document.querySelector('.profile-avatar')
        };
        if (elements.name) elements.name.textContent = userData.name;
        if (elements.username) elements.username.textContent = `@${userData.username}`;
        if (elements.bio) elements.bio.textContent = userData.bio || 'No bio yet';
        if (userData.image && elements.avatar) {
            elements.avatar.src = userData.image;
        }
    }
    function initFollowModal() {
        const followModalClose = document.getElementById('followModalClose');
        const followTabs = document.querySelectorAll('.follow-tab');
        const followSections = {
            followers: document.getElementById('followersSection'),
            following: document.getElementById('followingSection')
        };
        document.querySelectorAll('.stat-item[data-target="followers"], .stat-item[data-target="following"]')
            .forEach(item => {
                item.addEventListener('click', () => {
                    const type = item.getAttribute('data-target');
                    showFollowModal(type);
                });
            });
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
            } catch (error) {
                console.error('Error:', error);
            }
        });
        function showFollowModal(type) {
            document.getElementById('followModalTitle').textContent = 
                type === 'followers' ? 'Followers' : 'Following';
            DOM.modals.follow.classList.add('active');
            document.body.style.overflow = 'hidden';
            Object.values(followSections).forEach(section => {
                if (section) section.style.display = 'none';
            });
            if (followSections[type]) followSections[type].style.display = 'block';
            followTabs.forEach(tab => {
                tab.classList.toggle('active', tab.getAttribute('data-type') === type);
            });
        }
    }
    function initPostModal() {
        const mediaSliderTrack = document.querySelector('.media-slider-track');
        const prevButton = document.querySelector('.media-nav-button.prev');
        const nextButton = document.querySelector('.media-nav-button.next');
        const modalClose = document.getElementById('modalClose');
        document.addEventListener('click', async (e) => {
            const postItem = e.target.closest('.post-item');
            if (postItem) {
                const postId = postItem.getAttribute('data-post-id');
                await loadPostModal(postId);
            }
        });
        if (prevButton) prevButton.addEventListener('click', showPrevSlide);
        if (nextButton) nextButton.addEventListener('click', showNextSlide);
        document.addEventListener('keydown', (e) => {
            if (!DOM.modals.post.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') showPrevSlide();
            else if (e.key === 'ArrowRight') showNextSlide();
        });
        if (modalClose) {
            modalClose.addEventListener('click', () => {
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
                initMediaSlider(state.currentPost.media);
                updatePostInfo(state.currentPost);
            } catch (error) {
                console.error('Error loading post:', error);
                showModalError();
            }
        }
        function initMediaSlider(mediaArray) {
            if (!mediaSliderTrack) return;
            mediaSliderTrack.innerHTML = '';
            state.postSlides = [];
            if (!mediaArray?.length) {
                showNoMediaPlaceholder();
                return;
            }
            mediaArray.forEach((media, index) => {
                const slide = document.createElement('div');
                slide.className = 'media-slide';
                const img = document.createElement('img');
                img.src = media.url;
                img.alt = `Post image ${index + 1}`;
                img.loading = 'lazy';
                slide.appendChild(img);
                mediaSliderTrack.appendChild(slide);
                state.postSlides.push(slide);
            });
            updateSliderPosition();
            updateNavButtons();
        }
        function updateSliderPosition() {
            const slideWidth = 100;
            mediaSliderTrack.style.transform = `translateX(-${state.currentSlideIndex * slideWidth}%)`;
        }
        function updateNavButtons() {
            if (!state.currentPost?.media) {
                if (prevButton) prevButton.style.display = 'none';
                if (nextButton) nextButton.style.display = 'none';
                return;
            }
            if (prevButton) prevButton.style.display = state.currentSlideIndex > 0 ? 'flex' : 'none';
            if (nextButton) nextButton.style.display = 
                state.currentSlideIndex < state.currentPost.media.length - 1 ? 'flex' : 'none';
        }
        function showPrevSlide() {
            if (state.currentSlideIndex > 0) {
                state.currentSlideIndex--;
                updateSliderPosition();
                updateNavButtons();
            }
        }
        function showNextSlide() {
            if (state.currentPost?.media && 
                state.currentSlideIndex < state.currentPost.media.length - 1) {
                state.currentSlideIndex++;
                updateSliderPosition();
                updateNavButtons();
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
        function showModalError() {
            const setTextContent = (id, text) => {
                const el = document.getElementById(id);
                if (el) el.textContent = text;
            };
            setTextContent('modalPostTitle', 'Error');
            setTextContent('modalDescription', 'Failed to load post. Please try again.');
        }
        function showNoMediaPlaceholder() {
            if (!mediaSliderTrack) return;
            mediaSliderTrack.innerHTML = `
                <div class="no-media">
                    <i class="fas fa-image"></i>
                    <p>No media available</p>
                </div>
            `;
            updateNavButtons();
        }
    }
    initTabs();
    initStatItems();
    initModals();
    initFollowButton();
});