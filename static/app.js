// ===== CONSTANTS =====
const API_BASE_URL = window.location.origin;

// ===== GLOBAL STATE =====
let currentResults = null;
let sessionId = null;
let materialsCount = 0;

// ===== DOM ELEMENTS =====
const elements = {
    // Tabs
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // List upload
    uploadListCard: document.getElementById('uploadListCard'),
    uploadListForm: document.getElementById('uploadListForm'),
    uploadListArea: document.getElementById('uploadListArea'),
    listFileInput: document.getElementById('listFileInput'),
    listFileInfo: document.getElementById('listFileInfo'),
    listFileName: document.getElementById('listFileName'),
    listFileSize: document.getElementById('listFileSize'),
    removeListFile: document.getElementById('removeListFile'),
    uploadListButton: document.getElementById('uploadListButton'),
    
    // Search card
    searchCard: document.getElementById('searchCard'),
    materialsCount: document.getElementById('materialsCount'),
    changeListButton: document.getElementById('changeListButton'),
    
    // Search form
    searchForm: document.getElementById('searchForm'),
    searchInput: document.getElementById('searchInput'),
    searchButton: document.getElementById('searchButton'),
    topKSlider: document.getElementById('topK'),
    topKValue: document.getElementById('topKValue'),
    
    // Upload form
    uploadForm: document.getElementById('uploadForm'),
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    fileInfo: document.getElementById('fileInfo'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    removeFile: document.getElementById('removeFile'),
    uploadType: document.getElementById('uploadType'),
    uploadButton: document.getElementById('uploadButton'),
    
    // Results
    resultsSection: document.getElementById('resultsSection'),
    resultsStats: document.getElementById('resultsStats'),
    resultsContent: document.getElementById('resultsContent'),
    downloadResults: document.getElementById('downloadResults'),
    clearResults: document.getElementById('clearResults'),
    
    // Loading & Alerts
    loadingOverlay: document.getElementById('loadingOverlay'),
    alertContainer: document.getElementById('alertContainer')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeListUpload();
    initializeSearch();
    initializeUpload();
    initializeResults();
});

// ===== TAB FUNCTIONALITY =====
function initializeTabs() {
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    elements.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update content
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.dataset.content === tabName);
    });
}

// ===== LIST UPLOAD FUNCTIONALITY =====
function initializeListUpload() {
    // File input change
    elements.listFileInput.addEventListener('change', handleListFileSelect);
    
    // Drag and drop
    elements.uploadListArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadListArea.classList.add('drag-over');
    });
    
    elements.uploadListArea.addEventListener('dragleave', () => {
        elements.uploadListArea.classList.remove('drag-over');
    });
    
    elements.uploadListArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadListArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            elements.listFileInput.files = files;
            handleListFileSelect();
        }
    });
    
    // Remove file
    elements.removeListFile.addEventListener('click', () => {
        elements.listFileInput.value = '';
        elements.listFileInfo.style.display = 'none';
    });
    
    // Form submission
    elements.uploadListForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleListUpload();
    });
}

function handleListFileSelect() {
    const file = elements.listFileInput.files[0];
    
    if (!file) {
        elements.listFileInfo.style.display = 'none';
        return;
    }
    
    // Validate file type
    if (!file.name.endsWith('.txt')) {
        showAlert('error', 'Invalid File', 'Please select a text file (.txt)');
        elements.listFileInput.value = '';
        return;
    }
    
    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showAlert('error', 'File Too Large', 'File size must be less than 10MB');
        elements.listFileInput.value = '';
        return;
    }
    
    // Display file info
    elements.listFileName.textContent = file.name;
    elements.listFileSize.textContent = formatFileSize(file.size);
    elements.listFileInfo.style.display = 'block';
}

async function handleListUpload() {
    const file = elements.listFileInput.files[0];
    
    if (!file) {
        showAlert('error', 'Error', 'Please select a file');
        return;
    }
    
    try {
        showLoading(true);
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/api/upload-list`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to upload materials list');
        }
        
        // Store session ID and materials count
        sessionId = data.session_id;
        materialsCount = data.material_count;
        
        // Update UI
        elements.materialsCount.textContent = `${materialsCount} materials loaded`;
        
        // Show search card, hide upload card
        elements.uploadListCard.style.display = 'none';
        elements.searchCard.style.display = 'block';
        
        showAlert('success', 'Success', data.message);
        
    } catch (error) {
        console.error('Upload error:', error);
        showAlert('error', 'Error', error.message);
    } finally {
        showLoading(false);
    }
}

// ===== SEARCH FUNCTIONALITY =====
function initializeSearch() {
    // Slider update
    elements.topKSlider.addEventListener('input', (e) => {
        elements.topKValue.textContent = e.target.value;
    });
    
    // Change list button
    if (elements.changeListButton) {
        elements.changeListButton.addEventListener('click', () => {
            elements.searchCard.style.display = 'none';
            elements.uploadListCard.style.display = 'block';
            sessionId = null;
            materialsCount = 0;
        });
    }
    
    // Form submission
    elements.searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSearch();
    });
}

async function handleSearch() {
    const description = elements.searchInput.value.trim();
    const topK = parseInt(elements.topKSlider.value);
    
    if (!description) {
        showAlert('error', 'Error', 'Please enter a description');
        return;
    }
    
    try {
        showLoadingWithProgress(true);
        
        // Use fetch to POST the search request
        const requestBody = {
            description: description,
            top_k: topK
        };
        
        // Add session ID if we have one (uploaded list)
        if (sessionId) {
            requestBody.session_id = sessionId;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error('Failed to start search');
        }
        
        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop(); // Keep incomplete line in buffer
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.substring(6);
                    try {
                        const data = JSON.parse(jsonStr);
                        
                        if (data.type === 'log') {
                            updateProgress(data.message, data.step, data.total);
                        } else if (data.type === 'complete') {
                            currentResults = data;
                            displaySearchResults(data);
                            showLoadingWithProgress(false);
                            showAlert('success', 'Success', `Found ${data.count} matching materials (${data.total_tokens} tokens)`);
                        } else if (data.type === 'error') {
                            throw new Error(data.message);
                        }
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showAlert('error', 'Error', error.message);
        showLoadingWithProgress(false);
    }
}

function displaySearchResults(data) {
    // Show results section
    elements.resultsSection.style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    // Display stats
    const modelInfo = data.model_used ? ` · Model: ${data.model_used}` : '';
    const tokenInfo = data.total_tokens ? ` · ${data.total_tokens} tokens` : '';
    
    elements.resultsStats.innerHTML = `
        <div class="results-stats-content">
            <div class="stat-item">
                <span class="stat-label">Query</span>
                <span class="stat-value">"${escapeHtml(data.query)}"</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Results Found</span>
                <span class="stat-value">${data.count}</span>
            </div>
            ${tokenInfo ? `
            <div class="stat-item">
                <span class="stat-label">Tokens Used</span>
                <span class="stat-value">${data.total_tokens}</span>
            </div>
            ` : ''}
        </div>
    `;
    
    // Display materials
    const materialsHTML = data.data.map((material, index) => {
        const score = material.confidence_score || material.similarity_score || 0;
        const scorePercent = (score * 100).toFixed(1);
        const scoreColor = score > 0.8 ? 'var(--success)' : score > 0.6 ? 'var(--info)' : 'var(--warning)';
        
        return `
            <div class="material-card">
                <div class="material-header">
                    <span class="material-code">${escapeHtml(material.codigo)}</span>
                    <span class="material-score" style="background: ${scoreColor}">
                        ${scorePercent}% match
                    </span>
                </div>
                <div class="material-body">
                    <div class="material-field">
                        <span class="material-label">Description</span>
                        <span class="material-value">${escapeHtml(material.resumen)}</span>
                    </div>
                    ${material.reasoning ? `
                    <div class="material-field">
                        <span class="material-label">AI Reasoning</span>
                        <span class="material-value" style="color: var(--neutral-600); font-style: italic;">
                            ${escapeHtml(material.reasoning)}
                        </span>
                    </div>
                    ` : ''}
                    ${material.tipo ? `
                    <div class="material-field">
                        <span class="material-label">Type</span>
                        <span class="material-value">${escapeHtml(material.tipo)}</span>
                    </div>
                    ` : ''}
                    ${material.ud ? `
                    <div class="material-field">
                        <span class="material-label">Unit</span>
                        <span class="material-value">${escapeHtml(material.ud)}</span>
                    </div>
                    ` : ''}
                    ${material.precio ? `
                    <div class="material-field">
                        <span class="material-label">Price</span>
                        <span class="material-value material-price">${material.precio}€</span>
                    </div>
                    ` : ''}
                    ${material.num_sub_materials !== undefined ? `
                    <div class="material-field">
                        <span class="material-label">Sub-materials</span>
                        <span class="material-value">${material.num_sub_materials}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    elements.resultsContent.innerHTML = materialsHTML;
}

// ===== UPLOAD FUNCTIONALITY =====
function initializeUpload() {
    // File input change
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('drag-over');
    });
    
    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('drag-over');
    });
    
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            elements.fileInput.files = files;
            handleFileSelect();
        }
    });
    
    // Remove file
    elements.removeFile.addEventListener('click', () => {
        elements.fileInput.value = '';
        elements.fileInfo.style.display = 'none';
    });
    
    // Form submission
    elements.uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleUpload();
    });
}

function handleFileSelect() {
    const file = elements.fileInput.files[0];
    
    if (!file) {
        elements.fileInfo.style.display = 'none';
        return;
    }
    
    // Validate file type
    const validTypes = ['.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
        showAlert('error', 'Invalid File', 'Please select an Excel file (.xlsx or .xls)');
        elements.fileInput.value = '';
        return;
    }
    
    // Validate file size (16MB)
    const maxSize = 16 * 1024 * 1024;
    if (file.size > maxSize) {
        showAlert('error', 'File Too Large', 'File size must be less than 16MB');
        elements.fileInput.value = '';
        return;
    }
    
    // Display file info
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    elements.fileInfo.style.display = 'block';
}

async function handleUpload() {
    const file = elements.fileInput.files[0];
    
    if (!file) {
        showAlert('error', 'Error', 'Please select a file');
        return;
    }
    
    const uploadType = elements.uploadType.value;
    
    try {
        showLoading(true);
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/api/${uploadType}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to process file');
        }
        
        currentResults = data;
        displayUploadResults(data);
        showAlert('success', 'Success', `Processed ${data.count} materials from file`);
        
    } catch (error) {
        console.error('Upload error:', error);
        showAlert('error', 'Error', error.message);
    } finally {
        showLoading(false);
    }
}

function displayUploadResults(data) {
    // Show results section
    elements.resultsSection.style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    // Display stats
    elements.resultsStats.innerHTML = `
        <div class="results-stats-content">
            <div class="stat-item">
                <span class="stat-label">Materials Found</span>
                <span class="stat-value">${data.count}</span>
            </div>
        </div>
    `;
    
    // Display materials
    const materialsHTML = data.data.map((item, index) => {
        // Handle different data structures
        if (typeof item === 'string') {
            // Text-only format
            return `
                <div class="material-card">
                    <div class="material-body">
                        <div class="material-field">
                            <span class="material-label">${index + 1}</span>
                            <span class="material-value">${escapeHtml(item)}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Full object format
            return `
                <div class="material-card">
                    <div class="material-header">
                        <span class="material-code">${escapeHtml(item.codigo)}</span>
                    </div>
                    <div class="material-body">
                        ${item.tipo ? `
                        <div class="material-field">
                            <span class="material-label">Type</span>
                            <span class="material-value">${escapeHtml(item.tipo)}</span>
                        </div>
                        ` : ''}
                        ${item.ud ? `
                        <div class="material-field">
                            <span class="material-label">Unit</span>
                            <span class="material-value">${escapeHtml(item.ud)}</span>
                        </div>
                        ` : ''}
                        <div class="material-field">
                            <span class="material-label">Description</span>
                            <span class="material-value">${escapeHtml(item.resumen)}</span>
                        </div>
                        ${item.precio !== undefined ? `
                        <div class="material-field">
                            <span class="material-label">Price</span>
                            <span class="material-value material-price">${item.precio}€</span>
                        </div>
                        ` : ''}
                        ${item.num_sub_materials !== undefined ? `
                        <div class="material-field">
                            <span class="material-label">Sub-materials</span>
                            <span class="material-value">${item.num_sub_materials}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
    }).join('');
    
    elements.resultsContent.innerHTML = materialsHTML;
}

// ===== RESULTS FUNCTIONALITY =====
function initializeResults() {
    elements.downloadResults.addEventListener('click', handleDownload);
    elements.clearResults.addEventListener('click', handleClearResults);
}

function handleDownload() {
    if (!currentResults) {
        showAlert('error', 'Error', 'No results to download');
        return;
    }
    
    const text = currentResults.text;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `materials_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert('success', 'Success', 'Results downloaded successfully');
}

function handleClearResults() {
    currentResults = null;
    elements.resultsSection.style.display = 'none';
    elements.resultsContent.innerHTML = '';
    elements.resultsStats.innerHTML = '';
}

// ===== LOADING OVERLAY =====
function showLoading(show) {
    elements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showLoadingWithProgress(show) {
    const overlay = elements.loadingOverlay;
    
    if (show) {
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p class="loading-text">Processing your request...</p>
                <div class="progress-logs" id="progressLogs"></div>
            </div>
        `;
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

function updateProgress(message, step, total) {
    const progressLogs = document.getElementById('progressLogs');
    if (progressLogs) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-item';
        progressBar.innerHTML = `
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${(step / total) * 100}%"></div>
            </div>
            <p class="progress-message">${escapeHtml(message)}</p>
        `;
        progressLogs.innerHTML = '';  // Clear previous
        progressLogs.appendChild(progressBar);
    }
}

// ===== ALERT SYSTEM =====
function showAlert(type, title, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const icons = {
        success: `<svg class="alert-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10L8 14L16 6" stroke="currentColor" stroke-width="2"/>
        </svg>`,
        error: `<svg class="alert-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M10 6V10M10 14V14.01" stroke="currentColor" stroke-width="2"/>
        </svg>`,
        info: `<svg class="alert-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M10 10V14M10 6V6.01" stroke="currentColor" stroke-width="2"/>
        </svg>`
    };
    
    alert.innerHTML = `
        <div class="alert-content">
            ${icons[type] || icons.info}
            <div class="alert-body">
                <div class="alert-title">${escapeHtml(title)}</div>
                <div class="alert-message">${escapeHtml(message)}</div>
            </div>
            <button class="alert-close" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2"/>
                </svg>
            </button>
        </div>
    `;
    
    elements.alertContainer.appendChild(alert);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        dismissAlert(alert);
    }, 5000);
    
    // Manual dismiss
    alert.querySelector('.alert-close').addEventListener('click', () => {
        dismissAlert(alert);
    });
}

function dismissAlert(alert) {
    alert.style.animation = 'slideInRight 0.3s reverse';
    setTimeout(() => {
        if (alert.parentElement) {
            alert.parentElement.removeChild(alert);
        }
    }, 300);
}

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

