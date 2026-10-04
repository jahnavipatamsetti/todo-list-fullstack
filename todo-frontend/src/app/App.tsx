import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { TaskProvider } from './context/TaskContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <PreferencesProvider>
          <TaskProvider>
            <RouterProvider router={router} />
            <Toaster />
          </TaskProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}