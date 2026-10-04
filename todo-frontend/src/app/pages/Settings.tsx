import { useState, useEffect, useRef } from "react";
import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { usePreferences, ACCENT_COLORS, AccentColor, DateFormatOption, TaskStatusOption } from "../context/PreferencesContext";
import { useTheme } from "next-themes";
import { api } from "../services/api";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Moon, Sun, Laptop, Check } from "lucide-react";

export default function Settings() {
  const { clearCompletedTasks, deleteAllTasks } = useTasks();
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { 
    accentColor, 
    setAccentColor, 
    showCompleted, 
    setShowCompleted, 
    defaultStatus, 
    setDefaultStatus, 
    dateFormat, 
    setDateFormat 
  } = usePreferences();

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  // Security / Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Avatar file upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file format. Please select a PNG, JPG, or GIF image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file size (2MB max)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > MAX_SIZE) {
      toast.error("File is too large. Avatar image size must be under 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Read and preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      toast.info("Avatar preview updated. Click 'Save Changes' to apply.");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Avatar removed. Click 'Save Changes' to apply.");
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        avatar: avatarPreview,
      });
      updateUser(updated);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await api.updatePassword({
        currentPassword,
        newPassword,
      });
      toast.success(response.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const initials = (name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=4F46E5&color=fff&size=128`;

  return (
    <main className="flex-1 overflow-auto bg-background">
      {/* Top Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-8 py-6">
          <h2 className="text-3xl font-semibold text-foreground">Settings</h2>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-4xl space-y-8">
          
          {/* 1. Profile Settings */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Profile Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your personal information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-6">
                <Avatar className="w-20 h-20 border-2 border-border shadow-sm ring-2 ring-primary/20">
                  <AvatarImage src={avatarPreview || defaultAvatarUrl} alt={name} className="object-cover" />
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">{initials}</AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Profile Avatar</h4>
                  <p className="text-sm text-muted-foreground">PNG, JPG or GIF up to 2MB</p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    className="hidden"
                  />

                  <div className="flex items-center gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-border text-foreground hover:bg-accent"
                    >
                      Change Avatar
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-input/50 border-border text-foreground focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    disabled
                    className="bg-muted/50 border-border text-muted-foreground cursor-not-allowed opacity-80"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t border-border mt-6 py-4 flex justify-end rounded-b-lg">
              <Button 
                onClick={handleSaveProfile} 
                disabled={isSavingProfile}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
              >
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          {/* 2. Security */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Security</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-foreground">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-input/50 border-border text-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-input/50 border-border text-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-input/50 border-border text-foreground focus-visible:ring-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t border-border mt-6 py-4 flex justify-end rounded-b-lg">
              <Button 
                onClick={handleUpdatePassword} 
                disabled={isUpdatingPassword}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </Card>

          {/* 3. Appearance & 4. Task Preferences */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* 3. Appearance */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Appearance</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Customize the theme and accent color
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selector */}
                <div className="space-y-2">
                  <Label className="text-base text-foreground">Theme Mode</Label>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Button
                      type="button"
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className={`flex items-center justify-center gap-2 h-10 ${
                        theme === "dark" 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "border-border hover:bg-accent text-foreground"
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Dark</span>
                    </Button>
                    <Button
                      type="button"
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className={`flex items-center justify-center gap-2 h-10 ${
                        theme === "light" 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "border-border hover:bg-accent text-foreground"
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span>Light</span>
                    </Button>
                    <Button
                      type="button"
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                      className={`flex items-center justify-center gap-2 h-10 ${
                        theme === "system" 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "border-border hover:bg-accent text-foreground"
                      }`}
                    >
                      <Laptop className="w-4 h-4" />
                      <span>System</span>
                    </Button>
                  </div>
                </div>
                
                {/* Accent Color Picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">Accent Color</Label>
                    <span className="text-xs font-medium text-muted-foreground">
                      {ACCENT_COLORS[accentColor]?.name || "Indigo"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((colorKey) => {
                      const item = ACCENT_COLORS[colorKey];
                      const isSelected = accentColor === colorKey;
                      return (
                        <button
                          key={colorKey}
                          type="button"
                          onClick={() => {
                            setAccentColor(colorKey);
                            toast.success(`Accent color changed to ${item.name}`);
                          }}
                          className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 ${
                            isSelected
                              ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110"
                              : "hover:opacity-90"
                          }`}
                          style={{ backgroundColor: item.hex }}
                          title={item.name}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Task Preferences */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Task Preferences</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Customize your workflow and display
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Keep completed tasks visible</Label>
                    <p className="text-sm text-muted-foreground">Show completed tasks in task lists</p>
                  </div>
                  <Switch 
                    checked={showCompleted} 
                    onCheckedChange={(checked) => {
                      setShowCompleted(checked);
                      toast.success(`Completed tasks are now ${checked ? 'visible' : 'hidden'}`);
                    }}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground">Default Status</Label>
                  <Select 
                    value={defaultStatus} 
                    onValueChange={(val) => {
                      setDefaultStatus(val as TaskStatusOption);
                      toast.success("Default status updated");
                    }}
                  >
                    <SelectTrigger className="w-full bg-input/50 border-border text-foreground">
                      <SelectValue placeholder="Select a default status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="backlog">Backlog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Date Display Format</Label>
                  <Select 
                    value={dateFormat} 
                    onValueChange={(val) => {
                      setDateFormat(val as DateFormatOption);
                      toast.success("Date display format updated");
                    }}
                  >
                    <SelectTrigger className="w-full bg-input/50 border-border text-foreground">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="relative">Relative (e.g. "Today", "In 2 days")</SelectItem>
                      <SelectItem value="absolute">Absolute (e.g. "Apr 5, 2026")</SelectItem>
                      <SelectItem value="iso">ISO (e.g. "2026-04-05")</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 5. Data Management (Danger Zone) */}
          <Card className="bg-card border-destructive/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                Danger Zone
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-background/50">
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground">Clear Completed Tasks</h4>
                  <p className="text-sm text-muted-foreground">Remove all checked tasks from your lists.</p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-border text-foreground hover:bg-accent shrink-0">
                      Clear Completed
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border text-foreground">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will permanently delete all your completed tasks from the database. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={clearCompletedTasks} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Yes, clear tasks
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <div className="space-y-1">
                  <h4 className="font-medium text-destructive">Delete All Tasks</h4>
                  <p className="text-sm text-muted-foreground">Permanently delete all tasks and reset your account data.</p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-destructive text-white hover:bg-destructive/90 shrink-0">
                      Delete All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border text-foreground">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete all tasks?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This is an irreversible action. All your tasks, history, and associated data will be completely wiped from the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={deleteAllTasks} className="bg-destructive text-white hover:bg-destructive/90">
                        Yes, delete everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  );
}