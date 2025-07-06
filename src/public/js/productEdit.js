document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.edit-product-form');
    const newImagesInput = document.getElementById('newImages');
    const newImagesPreview = document.getElementById('newImagesPreview');
    const deletedImagesInput = document.getElementById('deletedImages');
    let deletedImages = [];
    document.querySelectorAll('.delete-image').forEach(button => {
        button.addEventListener('click', function() {
            const imageIndex = this.getAttribute('data-image-index');
            const imageUrl = this.closest('.image-preview').getAttribute('data-image-url');
            deletedImages.push(imageUrl);
            deletedImagesInput.value = JSON.stringify(deletedImages);
            this.closest('.image-preview').remove();
        });
    });
    newImagesInput.addEventListener('change', function() {
        newImagesPreview.innerHTML = '';
        if (this.files) {
            Array.from(this.files).forEach(file => {
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const preview = document.createElement('div');
                        preview.className = 'image-preview';
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        const deleteBtn = document.createElement('button');
                        deleteBtn.type = 'button';
                        deleteBtn.className = 'delete-image';
                        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                        deleteBtn.addEventListener('click', function() {
                            preview.remove();
                            const dt = new DataTransfer();
                            const input = document.getElementById('newImages');
                            Array.from(input.files).forEach(f => {
                                if (f.name !== file.name) {
                                    dt.items.add(f);
                                }
                            });
                            input.files = dt.files;
                        });
                        
                        preview.appendChild(img);
                        preview.appendChild(deleteBtn);
                        newImagesPreview.appendChild(preview);
                    }
                    
                    reader.readAsDataURL(file);
                }
            });
        }
    });
    form.addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        if (newImagesInput.files.length === 0) {
            const emptyInput = document.createElement('input');
            emptyInput.type = 'file';
            emptyInput.name = 'images';
            emptyInput.style.display = 'none';
            form.appendChild(emptyInput);
        }
    });
});