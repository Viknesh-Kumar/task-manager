// Global state
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';

// Get API URL from environment or use a configurable default
// For development: http://localhost:5000
// For production: https://your-render-url.onrender.com
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : `${window.location.origin}/api`;

console.log('API URL:', API_URL);

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskPriority = document.getElementById('taskPriority');
const taskDueDate = document.getElementById('taskDueDate');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadTasks();
    setupEventListeners();
});

// Theme Toggle
function initializeTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
});

// Setup Event Listeners
function setupEventListeners() {
    taskForm.addEventListener('submit', handleAddTask);
    searchInput.addEventListener('input', handleSearch);
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => handleFilterChange(e.target.dataset.filter));
    });
}

// Load tasks from API
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        tasks = await response.json();
        updateStats();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Error loading tasks. Check console for details.', 'error');
    }
}

// Add task
async function handleAddTask(e) {
    e.preventDefault();

    if (!taskTitle.value.trim()) {
        showNotification('Please enter a task title', 'error');
        return;
    }

    const newTask = {
        title: taskTitle.value.trim(),
        description: taskDescription.value.trim(),
        priority: taskPriority.value,
        due_date: taskDueDate.value
    };

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const createdTask = await response.json();
        tasks.push(createdTask);
        updateStats();
        renderTasks();
        taskForm.reset();
        showNotification('✅ Task added successfully!', 'success');
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('❌ Error adding task. Check console for details.', 'error');
    }
}

// Toggle task completion
async function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: !task.completed })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedTask = await response.json();
        const index = tasks.findIndex(t => t.id === taskId);
        tasks[index] = updatedTask;
        updateStats();
        renderTasks();
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Error updating task', 'error');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        tasks = tasks.filter(t => t.id !== taskId);
        updateStats();
        renderTasks();
        showNotification('✅ Task deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Error deleting task', 'error');
    }
}

// Handle search
function handleSearch(e) {
    searchQuery = e.target.value.toLowerCase();
    renderTasks();
}

// Handle filter change
function handleFilterChange(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTasks();
}

// Filter and search tasks
function getFilteredTasks() {
    let filtered = tasks;

    // Apply filter
    if (currentFilter === 'pending') {
        filtered = filtered.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(t => t.completed);
    }

    // Apply search
    if (searchQuery) {
        filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(searchQuery) ||
            t.description.toLowerCase().includes(searchQuery)
        );
    }

    return filtered;
}

// Render tasks
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';\n        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class=\"task-item ${task.completed ? 'completed' : ''}\">
            <input
                type=\"checkbox\"
                class=\"task-checkbox\"
                ${task.completed ? 'checked' : ''}
                onchange=\"toggleTask(${task.id})\"
            />
            <div class=\"task-content\">
                <div class=\"task-title\">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class=\"task-description\">${escapeHtml(task.description)}</div>` : ''}
                <div class=\"task-meta\">
                    <span class=\"priority-badge priority-${task.priority}\">
                        ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    ${task.due_date ? `
                        <span class=\"due-date\">
                            📅 ${formatDate(task.due_date)}
                        </span>
                    ` : ''}
                </div>
            </div>
            <div class=\"task-actions\">
                <button class=\"delete-btn\" onclick=\"deleteTask(${task.id})\">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Update statistics
async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stats = await response.json();

        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('pendingTasks').textContent = stats.pending;
        document.getElementById('progressPercent').textContent = Math.round(stats.progress) + '%';
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\"': '&quot;',
        \"'\": '&#039;'
    };
    return text.replace(/[&<>\"']/g, m => map[m]);
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Enhanced notification display
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
