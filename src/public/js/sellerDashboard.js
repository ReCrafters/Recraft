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
