#!/usr/bin/env python3
"""
Simple Task Manager Tool
A command-line task manager to organize and track daily tasks.
"""

import json
import os
from datetime import datetime
from pathlib import Path


class TaskManager:
    def __init__(self, storage_file="tasks.json"):
        self.storage_file = storage_file
        self.tasks = self.load_tasks()

    def load_tasks(self):
        """Load tasks from JSON file."""
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, "r") as f:
                    return json.load(f)
            except json.JSONDecodeError:
                return {"tasks": [], "next_id": 1}
        return {"tasks": [], "next_id": 1}

    def save_tasks(self):
        """Save tasks to JSON file."""
        with open(self.storage_file, "w") as f:
            json.dump(self.tasks, f, indent=2)

    def add_task(self, title):
        """Add a new task."""
        task_id = self.tasks["next_id"]
        task = {
            "id": task_id,
            "title": title,
            "status": "Pending",
            "created_at": datetime.now().isoformat(),
        }
        self.tasks["tasks"].append(task)
        self.tasks["next_id"] += 1
        self.save_tasks()
        print(f"✓ Task added: {title} (ID: {task_id})")
        return task_id

    def list_tasks(self, filter_status=None):
        """Display all tasks or filter by status."""
        tasks = self.tasks["tasks"]

        if filter_status:
            tasks = [t for t in tasks if t["status"] == filter_status]

        if not tasks:
            print("No tasks found.")
            return

        # Print header
        print(f"\n{'ID':<4} {'Task':<35} {'Status':<12}")
        print("-" * 52)

        # Print tasks
        for task in tasks:
            status_icon = "✓" if task["status"] == "Completed" else " "
            print(f"{task['id']:<4} {task['title']:<35} {task['status']:<12} {status_icon}")
        print()

    def complete_task(self, task_id):
        """Mark a task as complete."""
        for task in self.tasks["tasks"]:
            if task["id"] == task_id:
                task["status"] = "Completed"
                task["completed_at"] = datetime.now().isoformat()
                self.save_tasks()
                print(f"✓ Task completed: {task['title']}")
                return
        print(f"Task ID {task_id} not found.")

    def delete_task(self, task_id):
        """Delete a task."""
        for i, task in enumerate(self.tasks["tasks"]):
            if task["id"] == task_id:
                deleted_task = self.tasks["tasks"].pop(i)
                self.save_tasks()
                print(f"✓ Task deleted: {deleted_task['title']}")
                return
        print(f"Task ID {task_id} not found.")

    def show_stats(self):
        """Show task statistics."""
        total = len(self.tasks["tasks"])
        completed = sum(1 for t in self.tasks["tasks"] if t["status"] == "Completed")
        pending = total - completed

        print(f"\nStats:")
        print(f"  Total tasks: {total}")
        print(f"  Completed: {completed}")
        print(f"  Pending: {pending}")
        if total > 0:
            print(f"  Progress: {completed}/{total} ({100*completed//total}%)")
        print()


def show_help():
    """Display help message."""
    print(
        """
Available Commands:
  add <task>        - Add a new task
  list              - Show all tasks
  pending           - Show pending tasks only
  completed         - Show completed tasks only
  complete <id>     - Mark a task as complete
  delete <id>       - Delete a task
  stats             - Show task statistics
  help              - Show this help message
  exit              - Exit the program
"""
    )


def main():
    """Main entry point."""
    manager = TaskManager()

    print("\n" + "=" * 50)
    print("       Welcome to Task Manager Tool")
    print("=" * 50)
    print('Type "help" for available commands.\n')

    while True:
        try:
            user_input = input("> ").strip()

            if not user_input:
                continue

            parts = user_input.split(maxsplit=1)
            command = parts[0].lower()
            args = parts[1] if len(parts) > 1 else None

            if command == "exit":
                print("Goodbye!\n")
                break

            elif command == "help":
                show_help()

            elif command == "add":
                if args:
                    manager.add_task(args)
                else:
                    print("Please provide a task title.")

            elif command == "list":
                manager.list_tasks()

            elif command == "pending":
                manager.list_tasks(filter_status="Pending")

            elif command == "completed":
                manager.list_tasks(filter_status="Completed")

            elif command == "complete":
                if args:
                    try:
                        task_id = int(args)
                        manager.complete_task(task_id)
                    except ValueError:
                        print("Please provide a valid task ID.")
                else:
                    print("Please provide a task ID.")

            elif command == "delete":
                if args:
                    try:
                        task_id = int(args)
                        manager.delete_task(task_id)
                    except ValueError:
                        print("Please provide a valid task ID.")
                else:
                    print("Please provide a task ID.")

            elif command == "stats":
                manager.show_stats()

            else:
                print(f"Unknown command: {command}. Type 'help' for available commands.")

        except KeyboardInterrupt:
            print("\n\nGoodbye!\n")
            break
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()
