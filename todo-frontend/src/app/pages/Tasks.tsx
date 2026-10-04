import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, CheckSquare, SlidersHorizontal } from "lucide-react";
import { useTasks } from "../context/TaskContext";
import { usePreferences } from "../context/PreferencesContext";
import { TaskItem } from "../components/TaskItem";

export default function Tasks() {
  const { tasks } = useTasks();
  const { showCompleted } = usePreferences();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");

  // Filter tasks
  let filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    // When "all": if showCompleted preference is disabled, hide completed tasks
    if (!showCompleted) return !task.completed;
    return true;
  });

  // Search tasks
  if (searchQuery) {
    filteredTasks = filteredTasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort tasks
  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "date") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else {
      // Sort by status: pending first, then completed
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    }
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <main className="flex-1 overflow-auto bg-background">
      {/* Top Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-foreground mb-2">All Tasks</h2>
            <p className="text-muted-foreground">View and manage all your tasks in one place</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input-background border-input h-11"
              />
            </div>
          </div>

          {/* Filter and Sort */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={`transition-all duration-200 ${
                  filter === "all" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "border-border hover:border-primary/50 text-foreground"
                }`}
              >
                All <span className="ml-2 text-xs opacity-80">({totalCount})</span>
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
                className={`transition-all duration-200 ${
                  filter === "pending" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "border-border hover:border-primary/50 text-foreground"
                }`}
              >
                Pending <span className="ml-2 text-xs opacity-80">({pendingCount})</span>
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
                className={`transition-all duration-200 ${
                  filter === "completed" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "border-border hover:border-primary/50 text-foreground"
                }`}
              >
                Completed <span className="ml-2 text-xs opacity-80">({completedCount})</span>
              </Button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button
                variant={sortBy === "date" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("date")}
                className={`transition-all duration-200 ${
                  sortBy === "date" 
                    ? "bg-primary text-primary-foreground" 
                    : "border-border text-foreground"
                }`}
              >
                Date
              </Button>
              <Button
                variant={sortBy === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("status")}
                className={`transition-all duration-200 ${
                  sortBy === "status" 
                    ? "bg-primary text-primary-foreground" 
                    : "border-border text-foreground"
                }`}
              >
                Status
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-8">
        {filteredTasks.length === 0 ? (
          /* Empty State */
          <Card className="border-border bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <CheckSquare className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                {searchQuery 
                  ? "No tasks found" 
                  : filter === "all" 
                    ? "No tasks yet" 
                    : `No ${filter} tasks`
                }
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchQuery
                  ? `No tasks match "${searchQuery}". Try a different search term.`
                  : filter === "all"
                    ? "Get started by creating your first task from the Dashboard."
                    : `You don't have any ${filter} tasks at the moment.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
            </div>
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
