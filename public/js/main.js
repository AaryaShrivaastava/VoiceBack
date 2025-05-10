// main.js - Main JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Add active class to current navigation link
    const currentLocation = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');
    
    navItems.forEach(item => {
        const itemPath = item.getAttribute('href');
        if (currentLocation.includes(itemPath) && itemPath !== '#') {
            item.classList.add('active');
        } else if (currentLocation === '/' && itemPath === 'index.html') {
            item.classList.add('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Modal functionality
    const openModalButtons = document.querySelectorAll('[data-modal-target]');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget);
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    });
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modal when clicking outside content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Check if user is logged in
    checkAuthStatus();
});

// Function to check if user is authenticated
function checkAuthStatus() {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
        // User is logged in
        const loginButtons = document.querySelectorAll('a.btn:contains("Login / Register")');
        loginButtons.forEach(button => {
            button.textContent = 'My Account';
            button.href = '/account.html';
        });
        
        // Fetch user data if needed
        fetchUserData(token);
    }
}

// Function to fetch user data
function fetchUserData(token) {
    fetch('/api/user', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            // Token might be expired
            localStorage.removeItem('authToken');
            return;
        }
        return response.json();
    })
    .then(userData => {
        if (userData) {
            // Do something with user data if needed
            console.log('User data fetched');
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
    });
}