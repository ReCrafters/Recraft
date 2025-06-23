document.addEventListener('DOMContentLoaded', function () {

  // === Certification Upload Management ===
  const certInput = document.getElementById('certifications');
  const certList = document.getElementById('fileList');
  let selectedCerts = [];

  if (certInput) {
    certInput.addEventListener('change', function () {
      const newFiles = Array.from(this.files);
      if (newFiles.length + selectedCerts.length > 3) {
        alert('You can upload a maximum of 3 certification files.');
        return this.value = '';
      }

      for (const file of newFiles) {
        if (file.type !== 'application/pdf') {
          alert('Only PDF files are allowed.');
          return this.value = '';
        }
        if (!selectedCerts.some(f =>
          f.name === file.name &&
          f.size === file.size &&
          f.lastModified === file.lastModified
        )) {
          selectedCerts.push(file);
        }
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
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <span class="file-name">${file.name}</span>
        <span class="file-size">(${(file.size / 1024).toFixed(1)} KB)</span>
        <button type="button" class="remove-file" data-index="${index}">
          <i class="fas fa-times"></i>
        </button>
      `;
      certList.appendChild(fileItem);
    });

    document.querySelectorAll('.remove-file').forEach(button => {
      button.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'));
        selectedCerts.splice(index, 1);
        updateCertList();
        updateCertInput();
      });
    });
  }

  function updateCertInput() {
    const dataTransfer = new DataTransfer();
    selectedCerts.forEach(file => dataTransfer.items.add(file));
    certInput.files = dataTransfer.files;
  }

  updateCertList();

// === Image Upload Management ===
let selectedImages = [];

const imageInput = document.getElementById('images');
const imageList = document.getElementById('imageFileList');

if (imageInput && imageList) {
  imageInput.addEventListener('change', function () {
    const newFiles = Array.from(this.files);

    if (newFiles.length + selectedImages.length > 5) {
      alert('You can upload a maximum of 5 images.');
      return (this.value = '');
    }

    newFiles.forEach(file => {
      const fileExists = selectedImages.some(f =>
        f.name === file.name &&
        f.size === file.size &&
        f.lastModified === file.lastModified
      );
      if (!fileExists) {
        selectedImages.push(file);
      }
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
          const idx = parseInt(this.getAttribute('data-index'));
          selectedImages.splice(idx, 1);
          updateImageList();
          updateImageInput();
        });
      };

      reader.readAsDataURL(file);
    } else {
      // Empty slot placeholder (optional)
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


  // === Handle Alert Close Buttons ===
  document.querySelectorAll('.close-alert').forEach(button => {
    button.addEventListener('click', function () {
      this.parentElement.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => {
        this.parentElement.remove();
      }, 300);
    });
  });

  // === Form Submission with Spinner and FormData ===
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

        // tags as array
        const tags = form.tags.value.split(',').map(tag => tag.trim()).filter(Boolean);
        formData.set('tags', JSON.stringify(tags));

        // Replace certification field with selected files
        formData.delete('certifications');
        selectedCerts.forEach(file => {
          formData.append('certifications', file);
        });

        const response = await fetch('/products', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (response.ok) {
          alert('Product uploaded successfully!');
          form.reset();
          imageList.innerHTML = '';
          certList.innerHTML = '';
          selectedCerts = [];
        } else {
          alert(result.error || 'Something went wrong. Try again.');
        }
      } catch (err) {
        console.error('Error uploading:', err);
        alert('Network error or server failed. Try again later.');
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
  }
});
