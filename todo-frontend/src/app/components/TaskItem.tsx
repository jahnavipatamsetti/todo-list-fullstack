import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Calendar, MoreVertical, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Task, useTasks } from "../context/TaskContext";
import { usePreferences } from "../context/PreferencesContext";

interface TaskItemProps {
  task: Task;
  compact?: boolean;
}

export function TaskItem({ task, compact = false }: TaskItemProps) {
  const { toggleTaskComplete, deleteTask, updateTask } = useTasks();
  const { formatTaskDate } = usePreferences();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCleanDate = (dateString?: string | null) => {
    if (!dateString) return "";
    return dateString.includes("T") ? dateString.split("T")[0] : dateString;
  };

  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || "",
    dueDate: getCleanDate(task.dueDate),
  });

  useEffect(() => {
    setEditForm({
      title: task.title,
      description: task.description || "",
      dueDate: getCleanDate(task.dueDate),
    });
  }, [task]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm.title.trim()) {
      setIsSubmitting(true);
      try {
        await updateTask(task.id, {
          title: editForm.title.trim(),
          description: editForm.description.trim() || undefined,
          dueDate: editForm.dueDate || null,
        });
        setShowEditModal(false);
      } catch {
        // Handled in context
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      setShowDeleteAlert(false);
    } catch {
      // Handled in context
    }
  };

  const displayDate = formatTaskDate(task.dueDate, compact);

  return (
    <>
      <Card className="shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-200 border-border bg-card group">
        <CardContent className={compact ? "p-5" : "p-6"}>
          <div className="flex items-start gap-4">
            <div className={compact ? "pt-0.5" : "pt-1"}>
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTaskComplete(task.id)}
                className={`rounded-md data-[state=checked]:bg-primary data-[state=checked]:border-primary w-5 h-5 transition-all duration-200 ${compact ? "shadow-sm" : ""}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`${compact ? "text-base" : "text-lg"} font-medium mb-1 transition-all duration-200 ${
                  task.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground group-hover:text-primary"
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm mb-2 ${
                  task.completed ? "text-muted-foreground/70" : "text-muted-foreground"
                }`}>
                  {task.description}
                </p>
              )}
              {displayDate && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
                  <span>{displayDate}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  task.completed
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                }`}
              >
                {task.completed ? "Completed" : "Pending"}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteAlert(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task "{task.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-title-${task.id}`} className="text-foreground">Task Title *</Label>
              <Input
                id={`edit-title-${task.id}`}
                placeholder="Enter task title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
                className="bg-input-background border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-description-${task.id}`} className="text-foreground">Description</Label>
              <Textarea
                id={`edit-description-${task.id}`}
                placeholder="Add task description (optional)"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="bg-input-background border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-dueDate-${task.id}`} className="text-foreground">Due Date</Label>
              <Input
                id={`edit-dueDate-${task.id}`}
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                className="bg-input-background border-input"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditForm({
                    title: task.title,
                    description: task.description || "",
                    dueDate: getCleanDate(task.dueDate),
                  });
                }}
                className="border-border"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
