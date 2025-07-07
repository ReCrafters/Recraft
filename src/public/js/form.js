document.addEventListener('DOMContentLoaded', function() {
    let selectedFiles = [];
    const recycledCheckbox = document.getElementById('isRecycledMaterial');
    const recycledPercentageGroup = document.getElementById('recycledPercentageGroup');
    
    if (recycledCheckbox && recycledPercentageGroup) {
        recycledCheckbox.addEventListener('change', function() {
            recycledPercentageGroup.style.display = this.value === 'true' ? 'block' : 'none';
        });
    }
    document.querySelectorAll('.checkbox-tag').forEach(tag => {
        const checkbox = tag.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                tag.classList.add('selected');
            } else {
                tag.classList.remove('selected');
            }
        });
        if (checkbox.checked) {
            tag.classList.add('selected');
        }
    });
    const fileInput = document.getElementById('certifications');
    const fileList = document.getElementById('fileList');
    
    if (fileInput && fileList) {
        fileInput.addEventListener('change', function() {
            const newFiles = Array.from(this.files);
            if (selectedFiles.length + newFiles.length > 5) {
                alert('You can upload a maximum of 5 files');
                this.value = '';
                return;
            }
            selectedFiles = [...selectedFiles, ...newFiles];
            renderFileList();
            updateInputFiles();
        });
    }
    const form = document.getElementById('sustainabilityForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    form.addEventListener('submit', function(e) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Processing...
        `;
    });
    
    
    function renderFileList() {
        fileList.innerHTML = ''; 
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <button type="button" onclick="removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    }
    function updateInputFiles() {
        const dataTransfer = new DataTransfer();
        selectedFiles.forEach(file => {
            dataTransfer.items.add(file);
        });
        fileInput.files = dataTransfer.files;
    }
    window.removeFile = function(index) {
        selectedFiles.splice(index, 1);
        renderFileList();
        updateInputFiles();
    };
});