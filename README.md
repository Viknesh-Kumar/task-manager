# Task Manager - Modern Full Stack Web App

A beautiful, intuitive task management application inspired by Microsoft Tasks and Todoist with Kanban board, project management, and sub-tasks.

## Features

✨ **Core Features:**
- 📋 Create and manage multiple projects
- 📌 Kanban board view (To Do, In Progress, Done)
- ✅ Sub-tasks support
- 🏷️ Tags and priorities
- 📅 Due dates with reminders
- 🎨 Clean, elegant UI inspired by Microsoft Tasks
- 🌓 Dark/Light theme
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python Flask
- **Storage**: JSON (upgradeable to PostgreSQL)
- **Hosting**: Netlify (Frontend) + Render (Backend)

## Installation

### Prerequisites
- Python 3.8+
- pip

### Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

Visit `http://localhost:5000`

## Project Structure

```
task-manager/
├── app.py                 # Flask backend
├── requirements.txt       # Dependencies
├── tasks.json            # Data storage
├── public/
│   ├── index.html        # Main UI
│   ├── css/
│   │   └── style.css     # Elegant styling
│   └── js/
│       └── app.js        # Frontend logic
├── render.yaml           # Render config
├── Procfile             # Server config
└── README.md
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/<id>` - Update project
- `DELETE /api/projects/<id>` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task
- `POST /api/tasks/<id>/subtasks` - Add subtask
- `PUT /api/tasks/<id>/subtasks/<subtask_id>` - Update subtask
- `DELETE /api/tasks/<id>/subtasks/<subtask_id>` - Delete subtask

## Usage

1. **Create a Project** - Click "New Project" to get started
2. **Add Tasks** - Type a task name and choose status (To Do, In Progress, Done)
3. **Add Sub-tasks** - Click on a task to expand and add sub-tasks
4. **Set Priority & Due Date** - Use the task details panel
5. **Drag & Drop** - Move tasks between Kanban columns
6. **Switch Views** - Toggle between Kanban and List views

## Deployment

**Frontend (Netlify):**
- Connect GitHub repo
- Publish directory: `public`
- Auto-deploys on push

**Backend (Render):**
- Uses `render.yaml` configuration
- Auto-deploys on push

## License

MIT
