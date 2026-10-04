import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Plus, CheckCircle2, Clock, ListTodo, TrendingUp, Calendar } from "lucide-react";
import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";
import { TaskItem } from "../components/TaskItem";

export default function Dashboard() {
  const { tasks, addTask } = useTasks();
  const { user } = useAuth();
  const { showCompleted } = usePreferences();
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      setIsSubmitting(true);
      try {
        await addTask({
          title: newTask.title.trim(),
          description: newTask.description.trim() || undefined,
          dueDate: newTask.dueDate || null,
        });
        setNewTask({ title: "", description: "", dueDate: "" });
        setShowAddTaskModal(false);
      } catch {
        // Toast handled in context
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Get today's local date string: YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getTodayStr();
  
  // Filter tasks for today (respecting showCompleted preference)
  const allTodaysTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = task.dueDate.includes('T') ? task.dueDate.split('T')[0] : task.dueDate;
    return taskDate === today;
  });

  const displayedTodaysTasks = showCompleted 
    ? allTodaysTasks 
    : allTodaysTasks.filter(t => !t.completed);
  
  // Calculate dynamic stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'there';
  const initials = (user?.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=4F46E5&color=fff&size=128`;

  return (
    <main className="flex-1 overflow-auto bg-background">
      {/* Top Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border-2 border-border shadow-sm ring-2 ring-primary/20">
              <AvatarImage src={user?.avatar || defaultAvatarUrl} alt={user?.name || "User"} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-semibold text-foreground">{getGreeting()}, {displayName} 👋</h2>
              <p className="text-muted-foreground mt-0.5">Here's what you have today</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddTaskModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
                  <h3 className="text-3xl font-bold text-foreground">{totalTasks}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ListTodo className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <h3 className="text-3xl font-bold text-green-400">{completedTasks}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <h3 className="text-3xl font-bold text-yellow-400">{pendingTasks}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completion</p>
                  <h3 className="text-3xl font-bold text-primary">{completionPercentage}%</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productivity Progress */}
        <Card className="mb-8 border-border bg-gradient-to-br from-primary/5 to-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Daily Productivity</h3>
                <p className="text-sm text-muted-foreground">You completed {completionPercentage}% of your tasks</p>
              </div>
              <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <div className="mb-4">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Today's Tasks</h3>
          <p className="text-muted-foreground mb-6">
            {displayedTodaysTasks.length === 0 
              ? "No tasks scheduled for today. Enjoy your day! 🎉" 
              : `You have ${displayedTodaysTasks.length} task${displayedTodaysTasks.length > 1 ? 's' : ''} for today`
            }
          </p>
        </div>

        {displayedTodaysTasks.length === 0 ? (
          /* Empty State */
          <Card className="border-border bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">All clear for today!</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                You don't have any tasks scheduled for today. Create a new task or enjoy your free time!
              </p>
              <Button
                onClick={() => setShowAddTaskModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl space-y-3">
            {displayedTodaysTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Task Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
                autoFocus
                className="bg-input-background border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea
                id="description"
                placeholder="Add task description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
                className="bg-input-background border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-foreground">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="bg-input-background border-input"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddTaskModal(false);
                  setNewTask({ title: "", description: "", dueDate: "" });
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
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? "Adding..." : "Add Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
