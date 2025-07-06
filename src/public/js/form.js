document.addEventListener('DOMContentLoaded', function() {
    const isRecycledSelect = document.getElementById('isRecycled');
    const recycledPercentInput = document.getElementById('recycledPercent');
    isRecycledSelect.addEventListener('change', function() {
        if (this.value === 'true') {
            recycledPercentInput.disabled = false;
            recycledPercentInput.required = true;
            document.getElementById('recycledPercentGroup').style.opacity = '1';
        } else {
            recycledPercentInput.disabled = true;
            recycledPercentInput.required = false;
            recycledPercentInput.value = '';
            document.getElementById('recycledPercentGroup').style.opacity = '0.6';
        }
    });
    const fileInput = document.getElementById('certifications');
    const fileList = document.getElementById('fileList');
    let files = []; 
    fileInput.addEventListener('change', function() {
        if (this.files.length + files.length > 5) {
            alert('You can upload a maximum of 5 files.');
            this.value = '';
            return;
        }
        Array.from(this.files).forEach(file => {
            if (file.type !== 'application/pdf') {
                alert('Only PDF files are allowed.');
                this.value = '';
                return;
            }
            const fileExists = files.some(f => 
                f.name === file.name && 
                f.size === file.size && 
                f.lastModified === file.lastModified
            );
            if (!fileExists) {
                files.push(file);
            }
        });
        updateFileList();
        updateFileInput();
        this.value = '';
    });
    function updateFileList() {
        fileList.innerHTML = '';
        if (files.length === 0) {
            fileList.innerHTML = '<div class="no-files">No files selected</div>';
            return;
        }
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${(file.size/1024).toFixed(1)} KB)</span>
                <button type="button" class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
        document.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                files.splice(index, 1);
                updateFileList();
                updateFileInput();
            });
        });
    }
    function updateFileInput() {
        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
    }
    updateFileList();
    document.querySelectorAll('.close-alert').forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                this.parentElement.remove();
            }, 300);
        });
    });
    const form = document.getElementById('sustainabilityForm');
form.addEventListener('submit', function () {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
});
});