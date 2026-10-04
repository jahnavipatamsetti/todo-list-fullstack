const API_BASE_URL = 'http://localhost:3000';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TaskDto {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: string | null;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string | null;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  // Auth
  async signup(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  // Profile & Password
  async getProfile(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse<User>(res);
  },

  async updateProfile(data: { name?: string; avatar?: string | null }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/profile/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Tasks
  async getTasks(): Promise<TaskDto[]> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse<TaskDto[]>(res);
  },

  async createTask(data: CreateTaskPayload): Promise<TaskDto> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description || undefined,
        dueDate: data.dueDate || null,
      }),
    });
    return handleResponse<TaskDto>(res);
  },

  async updateTask(id: string | number, data: UpdateTaskPayload): Promise<TaskDto> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        ...data,
        dueDate: data.dueDate !== undefined ? (data.dueDate || null) : undefined,
      }),
    });
    return handleResponse<TaskDto>(res);
  },

  async deleteTask(id: string | number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse<{ message: string }>(res);
  },
};
