#!/usr/bin/env python3
"""
Task Manager - Full Stack Web App
Flask backend API for task management
"""

import json
import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

STORAGE_FILE = 'tasks.json'


def load_tasks():
    """Load tasks from JSON file."""
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {'tasks': [], 'next_id': 1}
    return {'tasks': [], 'next_id': 1}


def save_tasks(data):
    """Save tasks to JSON file."""
    with open(STORAGE_FILE, 'w') as f:
        json.dump(data, f, indent=2)


@app.route('/')
def index():
    """Serve the main index page."""
    return send_from_directory('public', 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files."""
    return send_from_directory('public', filename)


@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks."""
    data = load_tasks()
    return jsonify(data['tasks'])


@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task."""
    task_data = request.json
    data = load_tasks()

    task = {
        'id': data['next_id'],
        'title': task_data.get('title', 'Untitled'),
        'description': task_data.get('description', ''),
        'priority': task_data.get('priority', 'medium'),
        'due_date': task_data.get('due_date', ''),
        'completed': False,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }

    data['tasks'].append(task)
    data['next_id'] += 1
    save_tasks(data)

    return jsonify(task), 201


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task."""
    update_data = request.json
    data = load_tasks()

    for task in data['tasks']:
        if task['id'] == task_id:
            task.update({
                'title': update_data.get('title', task['title']),
                'description': update_data.get('description', task['description']),
                'priority': update_data.get('priority', task['priority']),
                'due_date': update_data.get('due_date', task['due_date']),
                'completed': update_data.get('completed', task['completed']),
                'updated_at': datetime.now().isoformat()
            })
            save_tasks(data)
            return jsonify(task)

    return jsonify({'error': 'Task not found'}), 404


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task."""
    data = load_tasks()

    for i, task in enumerate(data['tasks']):
        if task['id'] == task_id:
            deleted_task = data['tasks'].pop(i)
            save_tasks(data)
            return jsonify(deleted_task)

    return jsonify({'error': 'Task not found'}), 404


@app.route('/api/tasks/search', methods=['GET'])
def search_tasks():
    """Search tasks by title or description."""
    query = request.args.get('q', '').lower()
    data = load_tasks()

    results = [
        task for task in data['tasks']
        if query in task['title'].lower() or query in task['description'].lower()
    ]

    return jsonify(results)


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get task statistics."""
    data = load_tasks()
    tasks = data['tasks']

    total = len(tasks)
    completed = sum(1 for t in tasks if t['completed'])
    pending = total - completed

    stats = {
        'total': total,
        'completed': completed,
        'pending': pending,
        'progress': (completed / total * 100) if total > 0 else 0
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
