/**
 * Authentication page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Password toggle handlers
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            // Toggle password visibility
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Form validation
    const registerForm = document.querySelector('form[action="/register"]');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Check if passwords match
            if (password !== confirmPassword) {
                e.preventDefault();
                
                // Create alert if it doesn't exist
                let alertBox = document.querySelector('.alert.alert-danger');
                
                if (!alertBox) {
                    alertBox = document.createElement('div');
                    alertBox.className = 'alert alert-danger';
                    registerForm.insertBefore(alertBox, registerForm.firstChild);
                }
                
                alertBox.textContent = 'Passwords do not match';
                
                // Scroll to top of form
                window.scrollTo({
                    top: registerForm.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        });
    }
}); 