'use client';

import { useState } from 'react';
import KanbanBoard from "@/components/tasks/kanban-board";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Task = {
  id: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'in-progress' | 'done';
};

export default function TasksPage() {
  const [open, setOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      content: taskName,
      priority,
      status: 'todo'
    };
    setTasks([...tasks, newTask]);
    setOpen(false);
    setTaskName('');
    setPriority('Medium');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline text-glow">Taskboard</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task Name</Label>
                <Input
                  id="task-name"
                  placeholder="Enter task name..."
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as 'Low' | 'Medium' | 'High')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddTask} className="w-full" disabled={!taskName.trim()}>
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <KanbanBoard tasks={tasks} onUpdateTaskStatus={handleUpdateTaskStatus} />
    </div>
  );
}
