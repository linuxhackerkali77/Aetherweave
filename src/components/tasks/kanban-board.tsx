'use client';

import { useState } from 'react';
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

const priorityClasses = {
  High: "bg-red-500/80 border-red-500 text-red-50",
  Medium: "bg-yellow-500/80 border-yellow-500 text-yellow-50",
  Low: "bg-green-500/80 border-green-500 text-green-50",
};

type Task = {
  id: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'in-progress' | 'done';
};

type KanbanBoardProps = {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => void;
};

const columns = [
  { id: 'todo', title: 'To Do', status: 'todo' as const },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const },
  { id: 'done', title: 'Completed', status: 'done' as const },
];

export default function KanbanBoard({ tasks, onUpdateTaskStatus }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col gap-4">
            <h2 className="text-xl font-headline text-center text-primary/80">{column.title}</h2>
            <Card className="min-h-[300px] flex-1">
              <CardContent className="p-4 space-y-4">
                {tasks.filter(task => task.status === column.status).map((task) => (
                  <Card
                    key={task.id}
                    className="bg-muted/50 border border-border hover:neon-border-primary cursor-pointer transition-all duration-300"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <p className="font-medium pr-2">{task.content}</p>
                        <Badge className={priorityClasses[task.priority]}>
                          {task.priority}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 py-4">
              <div>
                <p className="font-semibold mb-2">{selectedTask.content}</p>
                <Badge className={priorityClasses[selectedTask.priority]}>
                  {selectedTask.priority}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Move to:</p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={selectedTask.status === 'todo' ? 'default' : 'outline'}
                    onClick={() => {
                      onUpdateTaskStatus(selectedTask.id, 'todo');
                      setSelectedTask(null);
                    }}
                    className="w-full"
                  >
                    To Do
                  </Button>
                  <Button
                    variant={selectedTask.status === 'in-progress' ? 'default' : 'outline'}
                    onClick={() => {
                      onUpdateTaskStatus(selectedTask.id, 'in-progress');
                      setSelectedTask(null);
                    }}
                    className="w-full"
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={selectedTask.status === 'done' ? 'default' : 'outline'}
                    onClick={() => {
                      onUpdateTaskStatus(selectedTask.id, 'done');
                      setSelectedTask(null);
                    }}
                    className="w-full"
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
