    // Search functionality
    document.getElementById('inventorySearch').addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      document.querySelectorAll('.inventory-table tbody tr').forEach(row => {
        const productName = row.querySelector('.product-name').textContent.toLowerCase();
        row.style.display = productName.includes(searchTerm) ? '' : 'none';
      });
    });

    // Filter functionality
    function applyFilters() {
      const category = document.getElementById('categoryFilter').value;
      const status = document.getElementById('statusFilter').value;
      const stock = document.getElementById('stockFilter').value;
      
      document.querySelectorAll('.inventory-table tbody tr').forEach(row => {
        const rowCategory = row.querySelector('td:nth-child(2)').textContent;
        const rowStatus = row.querySelector('.status-badge').classList.contains(status) || status === '';
        const rowStock = row.classList.contains(stock + '-stock') || stock === '';
        
        const categoryMatch = category === '' || rowCategory === category;
        const statusMatch = status === '' || rowStatus;
        const stockMatch = stock === '' || (stock === 'low' && row.classList.contains('low-stock')) || 
                          (stock === 'out' && row.classList.contains('out-of-stock'));
        
        row.style.display = (categoryMatch && statusMatch && stockMatch) ? '' : 'none';
      });
    }

    document.querySelectorAll('.filters select').forEach(select => {
      select.addEventListener('change', applyFilters);
    });

    // Delete product modal
    let productToDelete = null;
    const deleteModal = document.getElementById('deleteModal');
    
    document.querySelectorAll('.btn-action.delete').forEach(btn => {
      btn.addEventListener('click', function() {
        productToDelete = this.getAttribute('data-product-id');
        deleteModal.style.display = 'block';
      });
    });

    document.querySelector('.close-modal').addEventListener('click', () => {
      deleteModal.style.display = 'none';
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
      deleteModal.style.display = 'none';
    });

    document.getElementById('confirmDelete').addEventListener('click', () => {
      if(productToDelete) {
        fetch(`/products/${productToDelete}`, {
          method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
          if(data.success) {
            location.reload();
          } else {
            alert('Error deleting product');
          }
        })
        .catch(err => {
          console.error('Error:', err);
          alert('Error deleting product');
        });
      }
      deleteModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if(e.target === deleteModal) {
        deleteModal.style.display = 'none';
      }
    });