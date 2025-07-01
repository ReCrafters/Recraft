document.addEventListener('DOMContentLoaded', function() {
    const mediaUpload = document.getElementById('mediaUpload');
    const mediaInput = document.getElementById('mediaInput');
    const mediaPreview = document.getElementById('mediaPreview');
    const mediaError = document.getElementById('mediaError');
    const caption = document.getElementById('caption');
    const charCount = document.getElementById('charCount');
    const captionError = document.getElementById('captionError');
    const category = document.getElementById('category');
    const categoryError = document.getElementById('categoryError');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const longitude = document.getElementById('longitude');
    const latitude = document.getElementById('latitude');
    const locationError = document.getElementById('locationError');
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const toast = document.getElementById('toast');
    const postForm = document.getElementById('postForm');
    let mediaFiles = [];
    initForm();
    function initForm() {
        mediaUpload.addEventListener('click', () => mediaInput.click());
        mediaInput.addEventListener('change', handleMediaUpload);
        caption.addEventListener('input', updateCharCount);
        getLocationBtn.addEventListener('click', getCurrentLocation);
        postForm.addEventListener('submit', handleSubmit);
        setupDragAndDrop();
        setupValidationListeners();
    }
    function setupDragAndDrop() {
        mediaUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            mediaUpload.style.borderColor = 'var(--primary)';
            mediaUpload.style.backgroundColor = 'rgba(46, 139, 87, 0.05)';
        });
        mediaUpload.addEventListener('dragleave', () => {
            mediaUpload.style.borderColor = 'var(--border)';
            mediaUpload.style.backgroundColor = 'rgba(245, 222, 179, 0.1)';
        });
        mediaUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            mediaUpload.style.borderColor = 'var(--border)';
            mediaUpload.style.backgroundColor = 'rgba(245, 222, 179, 0.1)';
            if (e.dataTransfer.files.length) {
                mediaInput.files = e.dataTransfer.files;
                handleMediaUpload({ target: mediaInput });
            }
        });
    }
    function setupValidationListeners() {
        [caption, category, longitude, latitude].forEach(element => {
            element.addEventListener('input', validateForm);
            element.addEventListener('change', validateForm);
        });
    }
    function handleMediaUpload(e) {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => 
            file.type.startsWith('image/') || file.type.startsWith('video/')
        );
        if (files.length > validFiles.length) {
            showError(mediaError, 'Some files were not images/videos and were not added');
        }
        if (validFiles.length > 5) {
            showError(mediaError, 'Maximum 5 files allowed. Only the first 5 were added');
            validFiles.splice(5);
        }
        mediaFiles = [...mediaFiles, ...validFiles].slice(0, 5);
        renderMediaPreview();
        validateForm();
    }
    function renderMediaPreview() {
        mediaPreview.innerHTML = '';
        if (mediaFiles.length === 0) {
            mediaError.style.display = 'none';
            return;
        }
        mediaFiles.forEach((file, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'media-thumbnail';
            if (file.type.startsWith('image/')) {
                createImageThumbnail(file, thumbnail, index);
            } else if (file.type.startsWith('video/')) {
                createVideoThumbnail(file, thumbnail, index);
            }
            mediaPreview.appendChild(thumbnail);
        });
    }
    function createImageThumbnail(file, thumbnail, index) {
        const reader = new FileReader();
        reader.onload = (e) => {
            thumbnail.innerHTML = `
                <img src="${e.target.result}" alt="Preview" loading="lazy">
                <button class="remove-btn" data-index="${index}" aria-label="Remove media">
                    <i class="fas fa-times"></i>
                </button>
            `;
            attachRemoveButton(thumbnail, index);
        };
        reader.readAsDataURL(file);
    }
    function createVideoThumbnail(file, thumbnail, index) {
        const videoURL = URL.createObjectURL(file);
        thumbnail.innerHTML = `
            <video muted playsinline>
                <source src="${videoURL}" type="${file.type}">
            </video>
            <div class="video-overlay">
                <div class="video-icon">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <button class="remove-btn" data-index="${index}" aria-label="Remove media">
                <i class="fas fa-times"></i>
            </button>
        `;
        const video = thumbnail.querySelector('video');
        video.addEventListener('mouseenter', () => video.play());
        video.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
        attachRemoveButton(thumbnail, index);
    }
    function attachRemoveButton(thumbnail, index) {
        thumbnail.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeMediaFile(index);
        });
    }
    function removeMediaFile(index) {
        if (mediaFiles[index].type.startsWith('video/')) {
            URL.revokeObjectURL(mediaFiles[index].url);
        } 
        mediaFiles.splice(index, 1);
        renderMediaPreview();
        validateForm();
    }
    function updateCharCount() {
        const count = caption.value.length;
        charCount.textContent = `${count}/200`;
        if (count > 180 && count <= 200) {
            charCount.className = 'char-count warning';
        } else if (count > 200) {
            charCount.className = 'char-count error';
        } else {
            charCount.className = 'char-count';
        }
        validateForm();
    }
    function getCurrentLocation() {
        if (!navigator.geolocation) {
            showError(locationError, 'Geolocation is not supported by your browser');
            return;
        }
        getLocationBtn.disabled = true;
        getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting Location...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                longitude.value = position.coords.longitude.toFixed(6);
                latitude.value = position.coords.latitude.toFixed(6);
                hideError(locationError);
                getLocationBtn.innerHTML = '<i class="fas fa-check-circle"></i> Location Found';
                validateForm();
            },
            (error) => {
                showError(locationError, 'Unable to retrieve your location. Please enter manually.');
                getLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use Current Location';
                getLocationBtn.disabled = false;
            }
        );
    }
    function validateForm() {
        let isValid = true;
        if (caption.value.trim() === '') {
            showError(captionError, 'Caption is required');
            isValid = false;
        } else if (caption.value.length > 200) {
            showError(captionError, 'Caption must be 200 characters or less');
            isValid = false;
        } else {
            hideError(captionError);
        }
        if (!category.value) {
            showError(categoryError, 'Please select a category');
            isValid = false;
        } else {
            hideError(categoryError);
        }
        if (!longitude.value || !latitude.value) {
            showError(locationError, 'Please provide location coordinates');
            isValid = false;
        } else {
            hideError(locationError);
        }
        submitBtn.disabled = !isValid;
        return isValid;
    }
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
    function hideError(element) {
        element.style.display = 'none';
    }
    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
    async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    try {
        submitBtn.disabled = true;
        loading.style.display = 'block';
        const formData = new FormData();
        formData.append('caption', caption.value.trim());
        formData.append('category', category.value);
        formData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: [parseFloat(longitude.value), parseFloat(latitude.value)]
        }));
        if (document.getElementById('materialType').value.trim()) {
        formData.append('materialType', document.getElementById('materialType').value.trim());
        }
        mediaFiles.forEach(file => {
        formData.append('media', file);  // This will be processed by multer
        });
        const response = await fetch('/posts', {
        method: 'POST',
        body: formData,
        credentials: 'include'
        });
        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
        }
        const data = await response.json();
        showToast('Post created successfully!', 'success');
        resetForm();
    } catch (error) {
        console.error('Submission error:', error);
        showToast(error.message || 'Failed to create post', 'error');
    } finally {
        submitBtn.disabled = false;
        loading.style.display = 'none';
    }
    }
    function resetForm() {
        postForm.reset();
        mediaFiles = [];
        mediaPreview.innerHTML = '';
        charCount.textContent = '0/200';
        charCount.className = 'char-count';
        getLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use Current Location';
        getLocationBtn.disabled = false;
        mediaFiles.forEach(file => {
            if (file.type.startsWith('video/') && file.url) {
                URL.revokeObjectURL(file.url);
            }
        });
    }
});