# Task Manager Tool

A simple command-line task manager to organize and track your daily tasks.

## Features

- ✅ Add tasks
- ✅ View all tasks
- ✅ Mark tasks as complete
- ✅ Delete tasks
- ✅ Persistent storage (tasks saved to JSON file)
- ✅ Filter tasks by status (pending/completed)

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```bash
python task_manager.py
```

### Commands

- `add <task>` - Add a new task
- `list` - Show all tasks
- `complete <task_id>` - Mark a task as complete
- `delete <task_id>` - Delete a task
- `pending` - Show pending tasks only
- `completed` - Show completed tasks only
- `help` - Show available commands
- `exit` - Exit the program

## Example

```
> add Buy groceries
Task added: Buy groceries (ID: 1)

> add Finish project report
Task added: Finish project report (ID: 2)

> list
ID | Task                    | Status
1  | Buy groceries          | Pending
2  | Finish project report  | Pending

> complete 1
Task completed: Buy groceries

> list
ID | Task                    | Status
1  | Buy groceries          | Completed
2  | Finish project report  | Pending
```

## File Structure

- `task_manager.py` - Main application
- `tasks.json` - Task storage file (auto-created)
- `requirements.txt` - Python dependencies

## License

MIT
