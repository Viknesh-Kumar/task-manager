// Global state
let currentProject = null;
let projects = [];
let tasks = {};

const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : `${window.location.origin}/api`;

console.log('API URL:', API_URL);

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const projectsList = document.getElementById('projectsList');
const projectsGrid = document.getElementById('projectsGrid');
const kanbanView = document.getElementById('kanbanView');
const projectsView = document.getElementById('projectsView');
const kanbanTitle = document.getElementById('kanbanTitle');
const backBtn = document.getElementById('backBtn');
const newProjectBtn = document.getElementById('newProjectBtn');
const createProjectBtn = document.getElementById('createProjectBtn');
const projectModal = document.getElementById('projectModal');
const taskModal = document.getElementById('taskModal');
const themeToggle = document.getElementById('themeToggle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupEventListeners();
    loadProjects();
});

// Theme
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

// Event Listeners
function setupEventListeners() {
    // Projects
    newProjectBtn.addEventListener('click', openProjectModal);
    createProjectBtn.addEventListener('click', openProjectModal);
    document.getElementById('saveProjectBtn').addEventListener('click', saveProject);
    document.getElementById('cancelProjectBtn').addEventListener('click', closeProjectModal);
    document.getElementById('closeProjectModalBtn').addEventListener('click', closeProjectModal);

    // Kanban
    backBtn.addEventListener('click', showProjectsView);
    document.querySelectorAll('.btn-add-task').forEach(btn => {
        btn.addEventListener('click', (e) => openTaskModal(e.target.dataset.status));
    });

    // Task Modal
    document.getElementById('closeModalBtn').addEventListener('click', closeTaskModal);
    document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
    document.getElementById('deleteTaskBtn').addEventListener('click', deleteCurrentTask);
    document.getElementById('addSubtaskBtn').addEventListener('click', addSubtaskInput);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

// PROJECTS
async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/projects`);
        if (!response.ok) throw new Error('Failed to load projects');
        projects = await response.json();
        renderProjectsList();
        renderProjectsGrid();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjectsList() {
    projectsList.innerHTML = projects.map(project => `
        <button class="project-item ${currentProject?.id === project.id ? 'active' : ''}" 
                onclick="selectProject(${project.id})" 
                style="--color: ${project.color}">
            ${project.name}
        </button>
    `).join('');
}

function renderProjectsGrid() {
    projectsGrid.innerHTML = projects.map(project => {
        const taskCount = project.tasks?.length || 0;
        const completedCount = project.tasks?.filter(t => t.completed).length || 0;
        return `
            <div class="project-card" style="border-left-color: ${project.color}" 
                 onclick="selectProject(${project.id})">
                <div class="project-card-header">
                    <div class="project-card-title">${project.name}</div>
                    <button class="btn-icon project-card-menu" onclick="deleteProject(${project.id}, event)">×</button>
                </div>
                <div class="project-card-stats">
                    <span>📋 ${taskCount} tasks</span>
                    <span>✓ ${completedCount} done</span>
                </div>
            </div>
        `;
    }).join('');
}

async function selectProject(projectId) {
    currentProject = projects.find(p => p.id === projectId);
    kanbanTitle.textContent = currentProject.name;
    renderKanbanBoard();
    showKanbanView();
}

function openProjectModal() {
    projectModal.classList.add('active');
    document.getElementById('projectName').focus();
}

function closeProjectModal() {
    projectModal.classList.remove('active');
    document.getElementById('projectName').value = '';
}

async function saveProject() {
    const name = document.getElementById('projectName').value.trim();
    const color = document.querySelector('input[name="projectColor"]:checked').value;

    if (!name) return;

    try {
        const response = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, color })
        });

        if (!response.ok) throw new Error('Failed to create project');
        closeProjectModal();
        await loadProjects();
    } catch (error) {
        console.error('Error creating project:', error);
    }
}

async function deleteProject(projectId, event) {
    event.stopPropagation();
    if (!confirm('Delete this project?')) return;

    try {
        const response = await fetch(`${API_URL}/projects/${projectId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete project');
        await loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
    }
}

// KANBAN
function renderKanbanBoard() {
    ['todo', 'inprogress', 'done'].forEach(status => {
        const statusTasks = currentProject.tasks.filter(t => t.status === status);
        const container = document.getElementById(`${status}Tasks`);
        const count = document.getElementById(`${status}Count`);

        count.textContent = statusTasks.length;
        container.innerHTML = statusTasks.map(task => `
            <div class="task-card ${task.priority}" onclick="openTaskModal(null, ${task.id})">
                <div class="task-card-title">${task.title}</div>
                <div class="task-card-footer">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    ${task.subtasks?.length ? `<span>🔗 ${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}</span>` : ''}
                </div>
            </div>
        `).join('');
    });
}

function showKanbanView() {
    projectsView.classList.remove('active');
    kanbanView.classList.add('active');
}

function showProjectsView() {
    kanbanView.classList.remove('active');
    projectsView.classList.add('active');
    currentProject = null;
}

// TASKS
let editingTask = null;

function openTaskModal(status, taskId) {
    editingTask = null;
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskPriority').value = 'medium';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('subtasksList').innerHTML = '';
    document.getElementById('deleteTaskBtn').style.display = taskId ? 'block' : 'none';

    if (taskId) {
        editingTask = currentProject.tasks.find(t => t.id === taskId);
        if (editingTask) {
            document.getElementById('taskTitle').value = editingTask.title;
            document.getElementById('taskDescription').value = editingTask.description;
            document.getElementById('taskPriority').value = editingTask.priority;
            document.getElementById('taskDueDate').value = editingTask.due_date;
            renderSubtasks();
        }
    }

    taskModal.classList.add('active');
    document.getElementById('taskTitle').focus();
}

function closeTaskModal() {
    taskModal.classList.remove('active');
    editingTask = null;
}

async function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) return;

    const taskData = {
        title,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        due_date: document.getElementById('taskDueDate').value,
        status: editingTask?.status || 'todo'
    };

    try {
        if (editingTask) {
            const response = await fetch(
                `${API_URL}/projects/${currentProject.id}/tasks/${editingTask.id}`,
                { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskData) }
            );
            if (!response.ok) throw new Error('Failed to update task');
        } else {
            const response = await fetch(
                `${API_URL}/projects/${currentProject.id}/tasks`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskData) }
            );
            if (!response.ok) throw new Error('Failed to create task');
        }
        closeTaskModal();
        await loadProjectTasks(currentProject.id);
    } catch (error) {
        console.error('Error saving task:', error);
    }
}

async function deleteCurrentTask() {
    if (!editingTask || !confirm('Delete this task?')) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${currentProject.id}/tasks/${editingTask.id}`,
            { method: 'DELETE' }
        );
        if (!response.ok) throw new Error('Failed to delete task');
        closeTaskModal();
        await loadProjectTasks(currentProject.id);
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function loadProjectTasks(projectId) {
    try {
        const response = await fetch(`${API_URL}/projects/${projectId}/tasks`);
        if (!response.ok) throw new Error('Failed to load tasks');
        currentProject.tasks = await response.json();
        renderKanbanBoard();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// SUBTASKS
function renderSubtasks() {
    const container = document.getElementById('subtasksList');
    if (!editingTask?.subtasks?.length) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = editingTask.subtasks.map((subtask, index) => `
        <div class="subtask-item">
            <input type="checkbox" class="subtask-checkbox" 
                   ${subtask.completed ? 'checked' : ''}
                   onchange="toggleSubtask(${editingTask.id}, ${subtask.id}, this.checked)">
            <span class="subtask-text ${subtask.completed ? 'completed' : ''}">${subtask.title}</span>
            <button class="subtask-delete" onclick="deleteSubtask(${editingTask.id}, ${subtask.id})">×</button>
        </div>
    `).join('');
}

function addSubtaskInput() {
    if (!editingTask) return;

    const title = prompt('Enter subtask title:');
    if (!title) return;

    fetch(`${API_URL}/projects/${currentProject.id}/tasks/${editingTask.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    }).then(() => loadProjectTasks(currentProject.id)).catch(console.error);
}

async function toggleSubtask(taskId, subtaskId, completed) {
    try {
        await fetch(
            `${API_URL}/projects/${currentProject.id}/tasks/${taskId}/subtasks/${subtaskId}`,
            { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed }) }
        );
        await loadProjectTasks(currentProject.id);
    } catch (error) {
        console.error('Error updating subtask:', error);
    }
}

async function deleteSubtask(taskId, subtaskId) {
    try {
        await fetch(
            `${API_URL}/projects/${currentProject.id}/tasks/${taskId}/subtasks/${subtaskId}`,
            { method: 'DELETE' }
        );
        await loadProjectTasks(currentProject.id);
    } catch (error) {
        console.error('Error deleting subtask:', error);
    }
}
