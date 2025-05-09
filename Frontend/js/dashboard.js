// dashboard.js - Dashboard functionality for VoiceBack platform

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard filters
    initFilters();
    
    // Load submissions data
    loadSubmissions();
    
    // Initialize analytics if on analytics page
    if (document.querySelector('.analytics-grid')) {
        loadAnalytics();
    }
});

// Initialize filter functionality
function initFilters() {
    const filterSelects = document.querySelectorAll('.filter-select');
    
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
}

// Apply filters to submissions
function applyFilters() {
    const sdgFilter = document.querySelector('select[data-filter="sdg"]')?.value || '';
    const regionFilter = document.querySelector('select[data-filter="region"]')?.value || '';
    const statusFilter = document.querySelector('select[data-filter="status"]')?.value || '';
    
    // Get API endpoint with query parameters
    let endpoint = '/api/submissions?';
    if (sdgFilter && sdgFilter !== 'Filter by SDG') {
        endpoint += `sdg=${encodeURIComponent(sdgFilter)}&`;
    }
    if (regionFilter && regionFilter !== 'Filter by Region') {
        endpoint += `region=${encodeURIComponent(regionFilter)}&`;
    }
    if (statusFilter && statusFilter !== 'Filter by Status') {
        endpoint += `status=${encodeURIComponent(statusFilter)}&`;
    }
    
    // Remove trailing '&' if present
    endpoint = endpoint.endsWith('&') ? endpoint.slice(0, -1) : endpoint;
    
    // Show loading state
    const submissionsGrid = document.querySelector('.submissions-grid');
    if (submissionsGrid) {
        submissionsGrid.innerHTML = '<div class="loading">Loading submissions...</div>';
    }
    
    // Fetch filtered submissions
    fetchSubmissions(endpoint);
}

// Fetch submissions from API
function loadSubmissions() {
    fetchSubmissions('/api/submissions');
}

function fetchSubmissions(endpoint = '/api/submissions') {
    const token = localStorage.getItem('authToken');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    fetch(endpoint, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load submissions');
            }
            return response.json();
        })
        .then(data => {
            renderSubmissions(data);
        })
        .catch(error => {
            console.error('Error loading submissions:', error);
            const submissionsGrid = document.querySelector('.submissions-grid');
            if (submissionsGrid) {
                submissionsGrid.innerHTML = `
                    <div class="error-message">
                        <p>Failed to load submissions. Please try again later.</p>
                    </div>
                `;
            }
        });
}

// Render submissions to dashboard
function renderSubmissions(submissions) {
    const submissionsGrid = document.querySelector('.submissions-grid');
    
    if (!submissionsGrid) return;
    
    if (!submissions || submissions.length === 0) {
        submissionsGrid.innerHTML = `
            <div class="no-results">
                <p>No submissions match your filters. Try adjusting your search criteria.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    submissions.forEach(submission => {
        html += `
        <div class="submission-card">
            <div class="submission-image">
                ${submission.imagePath ? 
                  `<img src="${submission.imagePath}" alt="${submission.title}">` : 
                  '<div class="placeholder-image"></div>'}
                <span class="submission-tag">${submission.sdgTag}</span>
            </div>
            <div class="submission-content">
                <h3 class="submission-title">${submission.title}</h3>
                <div class="submission-meta">
                    <span>${submission.location}</span>
                    <span>${formatDate(submission.createdAt)}</span>
                </div>
                <p class="submission-desc">${submission.description}</p>
                <div class="submission-footer">
                    <div class="upvote">
                        <button class="upvote-btn" data-id="${submission.id}" onclick="upvoteSubmission('${submission.id}')">
                            👍 ${submission.upvotes || 0} supporters
                        </button>
                    </div>
                    <span class="status-tag status-${submission.status.toLowerCase()}">${submission.status}</span>
                </div>
            </div>
        </div>
        `;
    });
    
    submissionsGrid.innerHTML = html;
    
    // Initialize upvote buttons
    initUpvoteButtons();
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
        // Format as MM/DD/YYYY
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
}

// Initialize upvote buttons
function initUpvoteButtons() {
    document.querySelectorAll('.upvote-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const submissionId = this.getAttribute('data-id');
            upvoteSubmission(submissionId);
        });
    });
}

// Upvote a submission
function upvoteSubmission(submissionId) {
    const token = localStorage.getItem('authToken');
    
    // If not logged in, redirect to login
    if (!token) {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }
    
    fetch(`/api/submissions/${submissionId}/upvote`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to upvote');
        }
        return response.json();
    })
    .then(data => {
        // Update upvote count in UI
        const upvoteBtn = document.querySelector(`.upvote-btn[data-id="${submissionId}"]`);
        if (upvoteBtn) {
            upvoteBtn.innerHTML = `👍 ${data.upvotes} supporters`;
        }
    })
    .catch(error => {
        console.error('Error upvoting submission:', error);
        alert('Failed to upvote. Please try again later.');
    });
}

// Load analytics data
function loadAnalytics() {
    const token = localStorage.getItem('authToken');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    fetch('/api/analytics', { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load analytics');
            }
            return response.json();
        })
        .then(data => {
            renderAnalytics(data);
        })
        .catch(error => {
            console.error('Error loading analytics:', error);
            document.querySelector('.analytics-grid').innerHTML = `
                <div class="error-message">
                    <p>Failed to load analytics. Please try again later.</p>
                </div>
            `;
        });
}

// Render analytics data
function renderAnalytics(data) {
    // Update summary numbers
    if (data.totalSubmissions) {
        document.getElementById('total-submissions').textContent = data.totalSubmissions;
    }
    if (data.resolvedIssues) {
        document.getElementById('resolved-issues').textContent = data.resolvedIssues;
    }
    if (data.activeNGOs) {
        document.getElementById('active-ngos').textContent = data.activeNGOs;
    }
    if (data.impactedPeople) {
        document.getElementById('impacted-people').textContent = data.impactedPeople;
    }
    
    // If using any chart libraries, initialize them here
    // Example with Chart.js would go here if needed
}