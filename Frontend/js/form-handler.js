// form-handler.js - Form validation and submission for VoiceBack platform

document.addEventListener('DOMContentLoaded', function() {
    // Handle the voice submission form
    const submissionForm = document.getElementById('voice-submission-form');
    if (submissionForm) {
        initSubmissionForm();
    }
    
    // Handle login/register forms if they exist
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        initLoginForm();
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        initRegisterForm();
    }
});

// Initialize submission form functionality
function initSubmissionForm() {
    const form = document.getElementById('voice-submission-form');
    const contactField = document.getElementById('contact');
    const anonymousCheckbox = document.getElementById('anonymous');
    const fileUpload = document.querySelector('.file-upload input[type="file"]');
    const fileUploadBtn = document.querySelector('.file-upload-btn');
    
    // Handle anonymous checkbox
    if (anonymousCheckbox && contactField) {
        anonymousCheckbox.addEventListener('change', function() {
            if (this.checked) {
                contactField.value = '';
                contactField.disabled = true;
                contactField.style.backgroundColor = '#f0f0f0';
            } else {
                contactField.disabled = false;
                contactField.style.backgroundColor = '';
            }
        });
    }
    
    // Handle file upload button
    if (fileUploadBtn && fileUpload) {
        fileUploadBtn.addEventListener('click', function() {
            fileUpload.click();
        });
        
        fileUpload.addEventListener('change', function() {
            updateFileUploadLabel(this);
        });
    }
    
    // Form validation and submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (validateForm(form)) {
            submitForm(form);
        }
    });
}

// Update file upload button text after file selection
function updateFileUploadLabel(fileInput) {
    const fileUploadBtn = document.querySelector('.file-upload-btn span');
    
    if (fileInput.files.length > 0) {
        const fileNames = Array.from(fileInput.files)
            .map(file => file.name)
            .join(', ');
        
        fileUploadBtn.textContent = fileNames;
    } else {
        fileUploadBtn.textContent = 'Click to upload images or videos';
    }
}

// Validate form before submission
function validateForm(form) {
    let isValid = true;
    
    // Reset all validation states
    form.querySelectorAll('.validation-message').forEach(el => {
        el.style.display = 'none';
    });
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (field.type === 'checkbox') {
            if (!field.checked) {
                isValid = false;
                showValidationError(field, 'This field is required');
            }
        } else if (!field.value.trim()) {
            isValid = false;
            showValidationError(field, 'This field is required');
        }
    });
    
    // Check email format if provided and not anonymous
    const emailField = form.querySelector('input[type="email"]');
    const anonymousCheckbox = form.querySelector('#anonymous');
    
    if (emailField && emailField.value && (!anonymousCheckbox || !anonymousCheckbox.checked)) {
        if (!validateEmail(emailField.value)) {
            isValid = false;
            showValidationError(emailField, 'Please enter a valid email address');
        }
    }
    
    // Check at least one SDG is selected
    const sdgCheckboxes = form.querySelectorAll('input[name="sdg"]');
    let sdgSelected = false;
    
    sdgCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            sdgSelected = true;
        }
    });
    
    if (!sdgSelected && sdgCheckboxes.length > 0) {
        isValid = false;
        const firstSdgCheckbox = sdgCheckboxes[0];
        showValidationError(firstSdgCheckbox, 'Please select at least one SDG');
    }
    
    return isValid;
}

// Show validation error message
function showValidationError(field, message) {
    let validationMessage = field.nextElementSibling;
    
    // If next element is not a validation message, create one
    if (!validationMessage || !validationMessage.classList.contains('validation-message')) {
        validationMessage = document.createElement('div');
        validationMessage.className = 'validation-message';
        field.parentNode.insertBefore(validationMessage, field.nextSibling);
    }
    
    validationMessage.textContent = message;
    validationMessage.style.display = 'block';
    
    // Highlight the field
    field.classList.add('invalid');
    
    // Remove highlighting on input
    field.addEventListener('input', function() {
        this.classList.remove('invalid');
        validationMessage.style.display = 'none';
    }, { once: true });
}

// Validate email format
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Submit form data to backend
function submitForm(form) {
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Create FormData object for file uploads
    const formData = new FormData(form);
    
    // Add any additional data if needed
    // formData.append('timestamp', new Date().toISOString());
    
    // Get auth token if logged in
    const token = localStorage.getItem('authToken');
    const headers = {};
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Send form data to server
    fetch('/api/submissions', {
        method: 'POST',
        headers: headers,
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Submission failed');
        }
        return response.json();
    })
    .then(data => {
        // Handle successful submission
        showSuccessMessage(form);
        
        // Reset form
        form.reset();
        
        // Reset file upload label
        const fileUploadBtn = document.querySelector('.file-upload-btn span');
        if (fileUploadBtn) {
            fileUploadBtn.textContent = 'Click to upload images or videos';
        }
        
        // If we have a submission ID, redirect to view it
        if (data.submissionId) {
            setTimeout(() => {
                window.location.href = `/submission.html?id=${data.submissionId}`;
            }, 2000);
        }
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        showErrorMessage(form, 'Failed to submit your voice. Please try again later.');
    })
    .finally(() => {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    });
}

// Show success message after form submission
function showSuccessMessage(form) {
    // Create success message container if it doesn't exist
    let successMessage = document.querySelector('.success-message');
    
    if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        form.parentNode.insertBefore(successMessage, form);
    }
    
    successMessage.innerHTML = `
        <div class="alert alert-success">
            <h4>Thank you for your submission!</h4>
            <p>Your voice has been received and will be reviewed soon.</p>
        </div>
    `;
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth' });
}

// Show error message after form submission failure
function showErrorMessage(form, message) {
    // Create error message container if it doesn't exist
    let errorMessage = document.querySelector('.error-message');
    
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        form.parentNode.insertBefore(errorMessage, form);
    }
    
    errorMessage.innerHTML = `
        <div class="alert alert-danger">
            <h4>Submission Error</h4>
            <p>${message}</p>
        </div>
    `;
    
    // Scroll to error message
    errorMessage.scrollIntoView({ behavior: 'smooth' });
}

// Initialize login form functionality
function initLoginForm() {
    const form = document.getElementById('login-form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (validateForm(form)) {
            const email = form.querySelector('input[name="email"]').value;
            const password = form.querySelector('input[name="password"]').value;
            
            // Handle login
            login(email, password, form);
        }
    });
}

// Handle login submission
function login(email, password, form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    })
    .then(data => {
        // Store auth token
        localStorage.setItem('authToken', data.token);
        
        // Redirect to dashboard or home page
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard.html';
        window.location.href = redirectUrl;
    })
    .catch(error => {
        console.error('Error logging in:', error);
        showErrorMessage(form, 'Invalid email or password. Please try again.');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    });
}

// Initialize registration form functionality
function initRegisterForm() {
    const form = document.getElementById('register-form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (validateForm(form)) {
            // Get form data
            const formData = new FormData(form);
            const userData = {};
            
            for (const [key, value] of formData.entries()) {
                userData[key] = value;
            }
            
            // Handle registration
            register(userData, form);
        }
    });
}

// Handle registration submission
function register(userData, form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';
    
    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        return response.json();
    })
    .then(data => {
        // Store auth token if provided
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        
        // Show success message
        showSuccessMessage(form);
        
        // Redirect to login page or dashboard
        setTimeout(() => {
            window.location.href = data.token ? '/dashboard.html' : '/login.html';
        }, 2000);
    })
    .catch(error => {
        console.error('Error registering:', error);
        showErrorMessage(form, 'Registration failed. Please try again.');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    });
}