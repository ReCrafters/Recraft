  
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    const roleSelect = document.getElementById('role');
    const userFields = document.querySelector('.user-fields');
    const sellerFields = document.querySelector('.seller-fields');
    const adminFields = document.querySelector('.admin-fields');

    roleSelect.addEventListener('change', function () {
      userFields.classList.add('hidden');
      sellerFields.classList.add('hidden');
      adminFields.classList.add('hidden');

      if (this.value === 'user') userFields.classList.remove('hidden');
      else if (this.value === 'seller') sellerFields.classList.remove('hidden');
      else if (this.value === 'admin') adminFields.classList.remove('hidden');
    });

  const toggle = document.getElementById('togglePassword');
  const passwordField = document.getElementById('password');
  const eyeIcon = document.getElementById('eyeIcon');

  toggle.addEventListener('change', function () {
    const isChecked = this.checked;
    passwordField.type = isChecked ? 'text' : 'password';
  });