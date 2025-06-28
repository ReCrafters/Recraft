document.addEventListener('DOMContentLoaded', function () {
  // === Image Upload Management ===
  const imageInput = document.getElementById('images');
  const imageList = document.getElementById('imageFileList');
  let selectedImages = [];

  if (imageInput) {
    imageInput.addEventListener('change', function () {
      const newFiles = Array.from(this.files);
      if (newFiles.length + selectedImages.length > 5) {
        alert('You can upload a maximum of 5 images.');
        return (this.value = '');
      }

      newFiles.forEach(file => {
        const exists = selectedImages.some(f =>
          f.name === file.name &&
          f.size === file.size &&
          f.lastModified === file.lastModified
        );
        if (!exists) selectedImages.push(file);
      });

      updateImageList();
      updateImageInput();
      this.value = '';
    });
  }

  function updateImageList() {
    imageList.innerHTML = '';
    const totalSlots = 5;

    for (let i = 0; i < totalSlots; i++) {
      const item = document.createElement('div');
      item.className = 'image-slot';

      if (i < selectedImages.length) {
        const file = selectedImages[i];
        const reader = new FileReader();

        reader.onload = function (e) {
          item.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}" class="preview-thumb">
            <button type="button" class="remove-image" data-index="${i}">
              <i class="fas fa-times"></i>
            </button>
          `;
          item.querySelector('.remove-image').addEventListener('click', function () {
            selectedImages.splice(i, 1);
            updateImageList();
            updateImageInput();
          });
        };
        reader.readAsDataURL(file);
      } else {
        item.innerHTML = `<div class="empty-slot">+</div>`;
      }

      imageList.appendChild(item);
    }
  }

  function updateImageInput() {
    const dt = new DataTransfer();
    selectedImages.forEach(file => dt.items.add(file));
    imageInput.files = dt.files;
  }

  // === Certification Upload Management ===
  const certInput = document.getElementById('certifications');
  const certList = document.getElementById('fileList');
  let selectedCerts = [];

  if (certInput) {
    certInput.addEventListener('change', function () {
      const newFiles = Array.from(this.files);
      if (newFiles.length + selectedCerts.length > 3) {
        alert('You can upload a maximum of 3 certification files.');
        return (this.value = '');
      }

      for (const file of newFiles) {
        if (file.type !== 'application/pdf') {
          alert('Only PDF files are allowed.');
          return (this.value = '');
        }

        const exists = selectedCerts.some(f =>
          f.name === file.name &&
          f.size === file.size &&
          f.lastModified === file.lastModified
        );
        if (!exists) selectedCerts.push(file);
      }

      updateCertList();
      updateCertInput();
      this.value = '';
    });
  }

  function updateCertList() {
    certList.innerHTML = '';
    if (selectedCerts.length === 0) {
      certList.innerHTML = '<p class="no-files">No files selected</p>';
      return;
    }

    selectedCerts.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `
        <span class="file-name">${file.name}</span>
        <span class="file-size">(${(file.size / 1024).toFixed(1)} KB)</span>
        <button type="button" class="remove-file" data-index="${index}">
          <i class="fas fa-times"></i>
        </button>
      `;
      certList.appendChild(item);
    });

    document.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-index'));
        selectedCerts.splice(idx, 1);
        updateCertList();
        updateCertInput();
      });
    });
  }

  function updateCertInput() {
    const dt = new DataTransfer();
    selectedCerts.forEach(file => dt.items.add(file));
    certInput.files = dt.files;
  }



  // === Form Submission ===
  const form = document.getElementById('uploadProductForm');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

      try {
        const formData = new FormData(form);

        const tags = form.tags.value.split(',').map(tag => tag.trim()).filter(Boolean);
        formData.set('tags', JSON.stringify(tags));

        formData.delete('verifiedDocuments');
        selectedCerts.forEach(file => formData.append('verifiedDocuments', file));

        formData.delete('images');
        selectedImages.forEach(file => formData.append('images', file));

        const response = await fetch('/products', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (response.ok) {
          alert('Product uploaded successfully!');
          form.reset();
          selectedImages = [];
          selectedCerts = [];
          imageList.innerHTML = '';
          certList.innerHTML = '';
        } else {
          alert(result.error || 'Something went wrong.');
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Upload failed. Please try again.');
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
  }
});
