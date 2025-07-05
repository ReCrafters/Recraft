document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.addEventListener('click', function() {
      document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
      
      this.classList.add('active');
      
      const newImageSrc = this.getAttribute('data-image');
      document.getElementById('mainImage').src = newImageSrc;
    });
  });

  const deleteModal = document.getElementById('deleteModal');
  const deleteBtn = document.getElementById('deleteProduct');
  const cancelDelete = document.getElementById('cancelDelete');
  
  deleteBtn.addEventListener('click', () => {
    deleteModal.style.display = 'flex';
  });
  
  cancelDelete.addEventListener('click', () => {
    deleteModal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if(e.target === deleteModal) {
      deleteModal.style.display = 'none';
    }
  });

  const productId = window.location.pathname.split('/').pop();

  let salesChart = null;
  let engagementChart = null;
  
  initializeEmptyCharts();
  
  fetchAnalyticsData(productId)
    .then(data => {
      updateCharts(data);
    })
    .catch(error => {
      console.error('Error loading analytics data:', error);
      showChartError();
    });
});

function initializeEmptyCharts() {
  const emptyData = {
    sales: [0, 0, 0, 0, 0, 0],
    engagement: [0, 0, 0, 0, 0]
  };
  
  const salesCtx = document.getElementById('salesChart')?.getContext('2d');
  const engagementCtx = document.getElementById('engagementChart')?.getContext('2d');
  
  if (salesCtx) {
    salesChart = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Monthly Sales',
          data: emptyData.sales,
          backgroundColor: 'rgba(85, 56, 32, 0.2)',
          borderColor: 'rgba(85, 56, 32, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
  
  if (engagementCtx) {
    engagementChart = new Chart(engagementCtx, {
      type: 'doughnut',
      data: {
        labels: ['Views', 'Add to Cart', 'Purchases', 'Returns', 'Reviews'],
        datasets: [{
          label: 'Customer Engagement',
          data: emptyData.engagement,
          backgroundColor: [
            'rgba(76, 175, 80, 0.7)',
            'rgba(33, 150, 243, 0.7)',
            'rgba(255, 152, 0, 0.7)',
            'rgba(244, 67, 54, 0.7)',
            'rgba(156, 39, 176, 0.7)'
          ],
          borderColor: [
            'rgba(76, 175, 80, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(244, 67, 54, 1)',
            'rgba(156, 39, 176, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'right' } },
        cutout: '70%'
      }
    });
  }
}

async function fetchAnalyticsData(productId) {
  try {
    const response = await fetch(`/seller/products/${productId}/analytics`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); 
    if (!data || data.error) {
      throw new Error(data?.error || 'Invalid data received');
    }   
    return data;    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error; 
  }
}

function updateCharts(data) {
  try {
    if (salesChart) {
      salesChart.data.datasets[0].data = data.sales || [0, 0, 0, 0, 0, 0];
      salesChart.update();
    }
    
    if (engagementChart) {
      engagementChart.data.datasets[0].data = data.engagement || [0, 0, 0, 0, 0];
      engagementChart.update();
    }
    
    const errorElements = document.querySelectorAll('.chart-error');
    errorElements.forEach(el => el.style.display = 'none');
    
  } catch (error) {
    console.error('Error updating charts:', error);
    showChartError();
  }
}

function showChartError() {
  const salesError = document.getElementById('salesChartError');
  const engagementError = document.getElementById('engagementChartError');
  if (salesError) salesError.style.display = 'block';
  if (engagementError) engagementError.style.display = 'block';
  const loadingIndicators = document.querySelectorAll('.chart-loading');
  loadingIndicators.forEach(el => el.style.display = 'none');
}