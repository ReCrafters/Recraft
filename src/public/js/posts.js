// Main Post Interaction Controller
class PostInteractions {
  constructor() {
    this.elements = {
      saveButtons: new Map()
    };
    this.currentMediaIndex = 0;
    this.currentPostMedia = [];
    this.init();
  }

  init() {
    this.initEventDelegation();
    this.initIntersectionObserver();
    this.initReportModal();
    this.initImageModal();
    this.setupMediaDataAttributes();
  }

  // Event delegation for better performance
  initEventDelegation() {
    const handleClick = (e) => {
      const target = e.target;
      if (target.closest('.post-menu-btn')) return this.handleMenuButtonClick(e);
      if (target.closest('.action-btn.like')) return this.handleLikeClick(e);
      if (target.closest('.action-btn.comment')) return this.handleCommentToggle(e);
      if (target.closest('.action-btn.share')) return this.handleShareClick(e);
      if (target.closest('.delete-comment')) return this.handleDeleteComment(e);
      if (target.closest('.action-btn.save') || target.closest('.menu-item.save')) return this.handleSaveClick(e);
      if (target.closest('.menu-item.follow')) return this.handleFollowClick(e);
      if (target.closest('.menu-item.report')) return this.handleReportClick(e);
      if (target.closest('.menu-item.delete')) return this.handleDeleteClick(e);
      if (target.closest('.media-item img')) return this.handleImageClick(e);
    };

    const handleSubmit = (e) => {
      if (e.target.closest('.comment-form')) return this.handleCommentSubmit(e);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
  }

  // Initialize image modal functionality
  initImageModal() {
    this.imageModal = document.getElementById('imageModal');
    this.modalImage = this.imageModal.querySelector('#modalImage');
    this.modalClose = this.imageModal.querySelector('.modal-close');
    this.prevBtn = this.imageModal.querySelector('.prev-btn');
    this.nextBtn = this.imageModal.querySelector('.next-btn');

    this.modalClose.addEventListener('click', () => this.closeImageModal());
    this.prevBtn.addEventListener('click', () => this.navigateMedia(-1));
    this.nextBtn.addEventListener('click', () => this.navigateMedia(1));
    this.imageModal.addEventListener('click', (e) => {
      if (e.target === this.imageModal) this.closeImageModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.imageModal.style.display !== 'flex') return;
      
      if (e.key === 'Escape') {
        this.closeImageModal();
      } else if (e.key === 'ArrowLeft') {
        this.navigateMedia(-1);
      } else if (e.key === 'ArrowRight') {
        this.navigateMedia(1);
      }
    });
  }

  // Handle image click to open modal
  handleImageClick(e) {
    const mediaItem = e.target.closest('.media-item');
    if (!mediaItem) return;

    const postCard = mediaItem.closest('.post-card');
    const mediaData = JSON.parse(postCard.dataset.media);
    this.currentPostMedia = mediaData.filter(item => item.type === 'image');
    
    const clickedIndex = Array.from(mediaItem.parentElement.children).indexOf(mediaItem);
    this.currentMediaIndex = this.currentPostMedia.findIndex(
      item => item.url === mediaItem.querySelector('img').src
    );

    if (this.currentMediaIndex >= 0) {
      this.showImageModal();
    }
  }

  // Show image modal with current image
  showImageModal() {
    if (this.currentPostMedia.length === 0) return;
    
    this.modalImage.src = this.currentPostMedia[this.currentMediaIndex].url;
    this.imageModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Update navigation button visibility
    this.prevBtn.style.visibility = this.currentMediaIndex > 0 ? 'visible' : 'hidden';
    this.nextBtn.style.visibility = this.currentMediaIndex < this.currentPostMedia.length - 1 ? 'visible' : 'hidden';
  }

  // Close image modal
  closeImageModal() {
    this.imageModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Navigate between images in modal
  navigateMedia(direction) {
    this.currentMediaIndex += direction;
    if (this.currentMediaIndex < 0) this.currentMediaIndex = 0;
    if (this.currentMediaIndex >= this.currentPostMedia.length) this.currentMediaIndex = this.currentPostMedia.length - 1;

    this.modalImage.src = this.currentPostMedia[this.currentMediaIndex].url;

    // Update navigation button visibility
    this.prevBtn.style.visibility = this.currentMediaIndex > 0 ? 'visible' : 'hidden';
    this.nextBtn.style.visibility = this.currentMediaIndex < this.currentPostMedia.length - 1 ? 'visible' : 'hidden';
  }

  // Intersection Observer for view tracking
  initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.trackPostView(entry.target.dataset.postid);
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px' 
    });

    document.querySelectorAll('.post-card').forEach(observer.observe.bind(observer));
  }

  // Initialize report modal
  initReportModal() {
    this.reportModal = new ReportModal();
  }

  // Setup media data attributes
  setupMediaDataAttributes() {
    document.querySelectorAll('.post-card').forEach(post => {
      const media = Array.from(post.querySelectorAll('.media-item')).map(item => {
        const isVideo = item.querySelector('video') !== null;
        return {
          url: isVideo ? item.querySelector('video source').src : item.querySelector('img').src,
          type: isVideo ? 'video' : 'image'
        };
      });
      post.dataset.media = JSON.stringify(media);
    });
  }

  // Menu button handler
handleMenuButtonClick(e) {
  e.stopPropagation();
  const menuButton = e.target.closest('.post-menu-btn');
  const menu = menuButton.nextElementSibling;
  const isMenuShowing = menu.classList.contains('show');

  // Close all menus first
  document.querySelectorAll('.post-menu').forEach(m => {
    m.classList.remove('show');
  });

  // Toggle the clicked menu only if it wasn't already showing
  if (!isMenuShowing) {
    menu.classList.add('show');
  }

  // Add click handler to close when clicking outside
  if (!isMenuShowing) {
    const clickOutsideHandler = (event) => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
        menu.classList.remove('show');
        document.removeEventListener('click', clickOutsideHandler);
      }
    };
    
    // Add the handler with a slight delay to avoid immediate closing
    setTimeout(() => {
      document.addEventListener('click', clickOutsideHandler);
    }, 10);
  }
}

  // Like functionality
  async handleLikeClick(e) {
    const button = e.target.closest('.action-btn.like');
    const postCard = button.closest('.post-card');
    const postId = postCard.dataset.postid;
    const icon = button.querySelector('i');
    const likesCount = postCard.querySelector('.likes-count');
    
    try {
      const originalIcon = icon.className;
      icon.className = 'fas fa-spinner fa-pulse';
      button.disabled = true;

      const response = await fetch(`/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Like failed');

      const data = await response.json();
      icon.className = data.liked ? 'fas fa-heart' : 'far fa-heart';
      button.classList.toggle('active', data.liked);
      likesCount.textContent = `${data.likesCount} likes`;
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      button.disabled = false;
    }
  }

  // Comment toggle
  handleCommentToggle(e) {
    const button = e.target.closest('.action-btn.comment');
    const commentsSection = button.closest('.post-card').querySelector('.comments-section');
    commentsSection.classList.toggle('expanded');
    button.classList.toggle('active');
  }

  // Comment submission
  async handleCommentSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('.comment-input');
    const commentText = input.value.trim();
    const postId = form.closest('.post-card').dataset.postid;
    
    if (!commentText) return;
    
    try {
      const response = await fetch(`/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Comment failed');

      const data = await response.json();
      this.addNewComment(form, data);
      input.value = '';
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  }

  // Add new comment to DOM
  addNewComment(form, data) {
    const commentsSection = form.closest('.post-card').querySelector('.comments-section');
    commentsSection.classList.add('expanded');
    
    const commentHtml = `
      <div class="comment" data-commentid="${data.comment._id}">
        <a href="/users/${data.comment.userID._id}">
          ${data.comment.userID.image ? 
            `<img src="${data.comment.userID.image}" class="comment-avatar" alt="${data.comment.userID.username}">` : 
            `<div class="comment-avatar default-avatar"><i class="fas fa-user"></i></div>`}
        </a>
        <div class="comment-content">
          <div class="comment-header">
            <a href="/users/${data.comment.userID._id}" class="comment-user">${data.comment.userID.username}</a>
            <span class="comment-time">Just now</span>
          </div>
          <p class="comment-text">${data.comment.text}</p>
          <div class="comment-actions">
            <span class="comment-action delete-comment">Delete</span>
          </div>
        </div>
      </div>
    `;
    
    commentsSection.insertAdjacentHTML('beforeend', commentHtml);
    
    const commentsCount = form.closest('.post-card').querySelector('.comments-count');
    commentsCount.textContent = `${data.commentsCount} comments`;
  }

  // Delete comment
  async handleDeleteComment(e) {
    const comment = e.target.closest('.comment');
    const commentId = comment.dataset.commentid;
    const postId = comment.closest('.post-card').dataset.postid;
    
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const response = await fetch(`/posts/${postId}/comment/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Delete failed');

      const data = await response.json();
      if (data.success) {
        comment.remove();
        const commentsCount = comment.closest('.post-card').querySelector('.comments-count');
        commentsCount.textContent = `${data.commentsCount} comments`;
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  }

  // Share functionality
  async handleShareClick(e) {
    const postId = e.target.closest('.post-card').dataset.postid;
    const postUrl = `${window.location.origin}/posts/${postId}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post on ReCraft',
          text: 'I found this interesting post on ReCraft:',
          url: postUrl
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  }

  // Save post click handler
  handleSaveClick(e) {
    const saveElement = e.target.closest('.action-btn.save') || e.target.closest('.menu-item.save');
    const postCard = saveElement.closest('.post-card');
    if (!postCard) return;
    
    const postId = postCard.dataset.postid;
    if (!postId) return;
    
    this.handleSave(postId, saveElement);
  }

  // Save post functionality
  async handleSave(postId, saveElement = null) {
    const saveButton = document.querySelector(`.post-card[data-postid="${postId}"] .action-btn.save`);
    const saveMenuItem = document.querySelector(`.post-card[data-postid="${postId}"] .menu-item.save`);
    
    const elementsToUpdate = [];
    if (saveButton) elementsToUpdate.push(saveButton);
    if (saveMenuItem) elementsToUpdate.push(saveMenuItem);
    if (saveElement && !elementsToUpdate.includes(saveElement)) elementsToUpdate.push(saveElement);
    
    if (elementsToUpdate.length === 0) {
      console.error('No save elements found for post:', postId);
      return;
    }

    try {
      const originalStates = elementsToUpdate.map(el => ({
        html: el.innerHTML,
        isActive: el.classList.contains('active')
      }));

      elementsToUpdate.forEach(el => {
        el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        el.classList.add('loading');
      });

      const response = await fetch(`/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      elementsToUpdate.forEach(el => {
        el.classList.toggle('active', data.action === 'saved');
        el.innerHTML = `
          <i class="${data.action === 'saved' ? 'fas' : 'far'} fa-bookmark"></i>
          <span>${data.action === 'saved' ? 'Saved' : 'Save'} Post</span>
        `;
        el.classList.remove('loading');
      });

    } catch (error) {
      console.error('Save failed:', error);
      elementsToUpdate.forEach((el, index) => {
        el.innerHTML = originalStates[index].html;
        el.classList.toggle('active', originalStates[index].isActive);
        el.classList.remove('loading');
      });
      this.showError('Failed to save post');
    }
  }

  // Follow user
async handleFollowClick(e) {
  const item = e.target.closest('.menu-item.follow');
  if (!item) return;
  
  const postCard = item.closest('.post-card');
  if (!postCard) return;
  
  const userId = postCard.dataset.userid || postCard.querySelector('.username')?.getAttribute('href')?.split('/').pop();
  if (!userId) return;

  try {
    const isCurrentlyFollowing = item.classList.contains('active');
    const actionText = isCurrentlyFollowing ? 'Unfollowing...' : 'Following...';
    
    // Show loading state
    const originalHTML = item.innerHTML;
    item.innerHTML = `
      <i class="fas fa-spinner fa-spin"></i>
      <span>${actionText}</span>
    `;
    item.classList.add('loading');

    const response = await fetch(`/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Follow action failed');
    }

    const data = await response.json();
    
    // Update UI based on response
    if (data.success) {
      item.innerHTML = `
        <i class="fas fa-${data.isFollowing ? 'check' : 'user-plus'}"></i>
        <span>${data.isFollowing ? 'Following' : 'Follow User'}</span>
      `;
      item.classList.toggle('active', data.isFollowing);
      
      // Update followers count if element exists
      const followersCountEl = postCard.querySelector('.followers-count');
      if (followersCountEl) {
        followersCountEl.textContent = `${data.followersCount} followers`;
      }
    }
  } catch (err) {
    console.error('Follow action error:', err);
    // Revert to original state
    item.innerHTML = originalHTML;
    this.showError(err.message || 'Failed to update follow status');
  } finally {
    item.classList.remove('loading');
  }
}

  // Report post
  handleReportClick(e) {
    const item = e.target.closest('.menu-item.report');
    const postCard = item.closest('.post-card');
    if (!postCard) return;
    
    const postId = postCard.dataset.postid;
    if (!postId) return;
    
    this.reportModal.open(postId);
  }

  // Delete post
  async handleDeleteClick(e) {
    const item = e.target.closest('.menu-item.delete');
    const postCard = item.closest('.post-card');
    if (!postCard) return;
    
    const postId = postCard.dataset.postid;
    if (!postId) return;
    
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Delete failed');

      const data = await response.json();
      if (data.success) postCard.remove();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  }

  // Show error message
  showError(message) {
    document.querySelectorAll('.save-error-message').forEach(el => el.remove());
    
    const errorEl = document.createElement('div');
    errorEl.className = 'save-error-message';
    errorEl.textContent = message;
    document.body.appendChild(errorEl);
    setTimeout(() => errorEl.remove(), 3000);
  }

  // Track post view
  trackPostView(postId) {
    fetch(`/posts/${postId}/view`, {
      method: 'POST',
      credentials: 'include'
    }).catch(err => console.error('View tracking failed:', err));
  }
}

// Report Modal Class
class ReportModal {
  constructor() {
    this.modal = document.createElement('div');
    this.modal.className = 'report-modal';
    this.modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h3>Report Content</h3>
        <form id="reportForm">
          <input type="hidden" id="reportedEntity" value="">
          <div class="form-group">
            <label>Reason</label>
            <select id="reason" required>
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Additional Details</label>
            <textarea id="detail" rows="4"></textarea>
          </div>
          <button type="submit">Submit Report</button>
          <div class="status-message"></div>
        </form>
      </div>
    `;
    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    this.modal.querySelector('.close-btn').addEventListener('click', () => this.close());
    this.modal.querySelector('#reportForm').addEventListener('submit', (e) => this.handleSubmit(e));
  }

  open(entityId) {
    this.modal.querySelector('#reportedEntity').value = entityId;
    this.modal.style.display = 'block';
    this.resetForm();
  }

  close() {
    this.modal.style.display = 'none';
  }

  resetForm() {
    this.modal.querySelector('#reason').value = '';
    this.modal.querySelector('#detail').value = '';
    this.setStatusMessage('');
  }

  setStatusMessage(message, isError = false) {
    const statusEl = this.modal.querySelector('.status-message');
    statusEl.textContent = message;
    statusEl.style.color = isError ? '#ff4444' : '#4CAF50';
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setStatusMessage('Submitting...');
    
    const reportData = {
      reportedEntity: this.modal.querySelector('#reportedEntity').value,
      reason: this.modal.querySelector('#reason').value,
      detail: this.modal.querySelector('#detail').value
    };

    try {
      const response = await fetch('/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      this.setStatusMessage('Report submitted successfully!');
      setTimeout(() => this.close(), 1500);
    } catch (error) {
      console.error('Report error:', error);
      this.setStatusMessage(`Error: ${error.message}`, true);
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => new PostInteractions());