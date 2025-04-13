/**
 * Common JavaScript functions for all pages
 */

// Function to show status messages
function showMessage(message, isError = false) {
    const statusMessageEl = document.getElementById('statusMessage');
    const errorMessageEl = document.getElementById('errorMessage');
    
    if (isError && errorMessageEl) {
        errorMessageEl.textContent = message;
        errorMessageEl.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorMessageEl.style.display = 'none';
        }, 5000);
    } else if (statusMessageEl) {
        statusMessageEl.textContent = message;
        statusMessageEl.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            statusMessageEl.style.display = 'none';
        }, 5000);
    } else {
        // Fallback to alert if elements not found
        if (isError) {
            console.error(message);
        } else {
            console.log(message);
        }
    }
}

// Function to validate file size
function validateFileSize(file, maxSize = 200 * 1024 * 1024) {
    if (file && file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        throw new Error(`File size exceeds the maximum allowed size (${maxSizeMB}MB).`);
    }
    return true;
}

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
    // Logout button click handler
    const logoutBtn = document.getElementById('logout-tab');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Show logout modal
            try {
                // Bootstrap 5 method
                const modalElement = document.getElementById('logoutModal');
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } catch (err) {
                // jQuery fallback
                $('#logoutModal').modal('show');
            }
        });
    }
}); 