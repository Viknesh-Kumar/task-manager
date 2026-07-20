#!/usr/bin/env python3
"""
Task Manager - Modern Full Stack Web App
Flask backend API with project and task management
"""

import json
import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

STORAGE_FILE = 'tasks.json'


def load_data():
    """Load all data from JSON file."""
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {'projects': [], 'next_project_id': 1, 'next_task_id': 1}
    return {'projects': [], 'next_project_id': 1, 'next_task_id': 1}


def save_data(data):
    """Save all data to JSON file."""
    with open(STORAGE_FILE, 'w') as f:
        json.dump(data, f, indent=2)


# ============== STATIC FILES ==============

@app.route('/')
def index():
    """Serve the main index page."""
    return send_from_directory('public', 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files."""
    return send_from_directory('public', filename)


# ============== PROJECTS ==============

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get all projects."""
    data = load_data()
    return jsonify(data.get('projects', []))


@app.route('/api/projects', methods=['POST'])
def create_project():
    """Create a new project."""
    project_data = request.json
    data = load_data()

    project = {
        'id': data.get('next_project_id', 1),
        'name': project_data.get('name', 'Untitled Project'),
        'color': project_data.get('color', '#6366f1'),
        'tasks': [],
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }

    data['projects'].append(project)
    data['next_project_id'] = data.get('next_project_id', 1) + 1
    save_data(data)

    return jsonify(project), 201


@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Update a project."""
    update_data = request.json
    data = load_data()

    for project in data.get('projects', []):
        if project['id'] == project_id:
            project.update({
                'name': update_data.get('name', project['name']),
                'color': update_data.get('color', project['color']),
                'updated_at': datetime.now().isoformat()
            })
            save_data(data)
            return jsonify(project)

    return jsonify({'error': 'Project not found'}), 404


@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project."""
    data = load_data()

    for i, project in enumerate(data.get('projects', [])):
        if project['id'] == project_id:
            deleted_project = data['projects'].pop(i)
            save_data(data)
            return jsonify(deleted_project)

    return jsonify({'error': 'Project not found'}), 404


# ============== TASKS ==============

@app.route('/api/projects/<int:project_id>/tasks', methods=['GET'])
def get_tasks(project_id):
    """Get tasks for a project."""
    data = load_data()

    for project in data.get('projects', []):
        if project['id'] == project_id:
            return jsonify(project.get('tasks', []))

    return jsonify([]), 404


@app.route('/api/projects/<int:project_id>/tasks', methods=['POST'])
def create_task(project_id):
    """Create a new task in a project."""
    task_data = request.json
    data = load_data()

    for project in data.get('projects', []):
        if project['id'] == project_id:
            task = {
                'id': data.get('next_task_id', 1),
                'title': task_data.get('title', 'Untitled Task'),
                'description': task_data.get('description', ''),
                'status': task_data.get('status', 'todo'),  # todo, inprogress, done
                'priority': task_data.get('priority', 'medium'),  # low, medium, high
                'due_date': task_data.get('due_date', ''),
                'tags': task_data.get('tags', []),
                'subtasks': [],
                'completed': False,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }

            project['tasks'].append(task)
            data['next_task_id'] = data.get('next_task_id', 1) + 1
            save_data(data)
            return jsonify(task), 201

    return jsonify({'error': 'Project not found'}), 404


@app.route('/api/projects/<int:project_id>/tasks/<int:task_id>', methods=['PUT'])
def update_task(project_id, task_id):
    """Update a task."""
    update_data = request.json
    data = load_data()

    for project in data.get('projects', []):
        if project['id'] == project_id:
            for task in project.get('tasks', []):
                if task['id'] == task_id:
                    task.update({
                        'title': update_data.get('title', task['title']),
                        'description': update_data.get('description', task['description']),
                        'status': update_data.get('status', task['status']),
                        'priority': update_data.get('priority', task['priority']),
                        'due_date': update_data.get('due_date', task['due_date']),
                        'tags': update_data.get('tags', task['tags']),
                        'completed': update_data.get('completed', task['completed']),
                        'updated_at': datetime.now().isoformat()
                    })
                    save_data(data)
                    return jsonify(task)

    return jsonify({'error': 'Task not found'}), 404


@app.route('/api/projects/<int:project_id>/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(project_id, task_id):
    """Delete a task."""
    data = load_data()

    for project in data.get('projects', []):
        if project['id'] == project_id:
            for i, task in enumerate(project.get('tasks', [])):
                if task['id'] == task_id:
                    deleted_task = project['tasks'].pop(i)
                    save_data(data)
                    return jsonify(deleted_task)

    return jsonify({'error': 'Task not found'}), 404


# ============== SUBTASKS ==============

@app.route('/api/projects/<int:project_id>/tasks/<int:task_id>/subtasks', methods=['POST'])
def create_subtask(project_id, task_id):
    """Create a subtask."""
    subtask_data = request.json
    data = load_data()

    for project in data.get('projects', []):
        if project['id'] == project_id:
            for task in project.get('tasks', []):
                if task['id'] == task_id:
                    subtask = {
                        'id': len(task.get('subtasks', [])) + 1,
                        'title': subtask_data.get('title', 'Untitled Subtask'),
                        'completed': False,
                        'created_at': datetime.now().isoformat()
                    }
                    task['subtasks'].append(subtask)
                    save_data(data)
                    return jsonify(subtask), 201

    return jsonify({'error': 'Task not found'}), 404


@app.route('/api/projects/<int:project_id>/tasks/<int:task_id>/subtasks/<int:subtask_id>', methods=['PUT'])
def update_subtask(project_id, task_id, subtask_id):
    """Update a subtask."""
    update_data = request.json
    data = load_data()

    for project in data.get('projects', []):
        if project['id'] == project_id:
            for task in project.get('tasks', []):
                if task['id'] == task_id:
                    for subtask in task.get('subtasks', []):
                        if subtask['id'] == subtask_id:
                            subtask.update({
                                'title': update_data.get('title', subtask['title']),
                                'completed': update_data.get('completed', subtask['completed'])
                            })
                            save_data(data)
                            return jsonify(subtask)

    return jsonify({'error': 'Subtask not found'}), 404


@app.route('/api/projects/<int:project_id>/tasks/<int:task_id>/subtasks/<int:subtask_id>', methods=['DELETE'])
def delete_subtask(project_id, task_id, subtask_id):
    """Delete a subtask."""
    data = load_data()

    for project in data.get('projects', []):
        if project['id'] == project_id:
            for task in project.get('tasks', []):
                if task['id'] == task_id:
                    for i, subtask in enumerate(task.get('subtasks', [])):
                        if subtask['id'] == subtask_id:
                            deleted_subtask = task['subtasks'].pop(i)
                            save_data(data)
                            return jsonify(deleted_subtask)

    return jsonify({'error': 'Subtask not found'}), 404


# ============== STATS ==============

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get overall statistics."""
    data = load_data()
    projects = data.get('projects', [])

    total_tasks = sum(len(p.get('tasks', [])) for p in projects)
    completed_tasks = sum(
        sum(1 for t in p.get('tasks', []) if t['completed'])
        for p in projects
    )

    stats = {
        'total_projects': len(projects),
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': total_tasks - completed_tasks
    }

    return jsonify(stats)


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors - return index.html for SPA routing."""
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Not found'}), 404
    return send_from_directory('public', 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
