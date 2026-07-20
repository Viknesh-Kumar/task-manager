# Task Manager - Full Stack Web App

A modern, responsive task management application with a beautiful web UI and REST API backend.

## Features

- ✅ Add, edit, and delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Filter tasks by status
- ✅ Search tasks
- ✅ Due dates and priorities
- ✅ Persistent storage
- ✅ Responsive design (mobile-friendly)
- ✅ Dark/Light theme toggle
- ✅ Real-time UI updates

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python Flask
- **Storage**: JSON (can be upgraded to database)
- **Hosting**: Netlify (Frontend) + Flask server

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

The app will be available at `http://localhost:5000`

## Project Structure

```
task-manager/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── tasks.json            # Task storage
├── public/
│   ├── index.html        # Main HTML
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── app.js        # Frontend logic
└── README.md
```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/<id>` - Update a task
- `DELETE /api/tasks/<id>` - Delete a task
- `GET /` - Serve the web UI

## Deployment

### Deploy Frontend to Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Set build settings:
   - Build command: (leave empty - static files)
   - Publish directory: `public`

### Deploy Backend

For the backend, you have options:
- Deploy to Render, Railway, or Heroku
- Use serverless functions
- Keep it local for development

## Usage

1. Open the web interface
2. Add tasks with title, description, priority, and due date
3. Click checkboxes to complete tasks
4. Use filters to view pending or completed tasks
5. Delete tasks with the trash icon
6. Toggle dark/light mode with the theme button

## License

MIT
