// Slice de Redux para manejo de tareas
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../../types/task';

interface TasksState {
  tasks: Task[];
}

const initialState: TasksState = {
  tasks: [],
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Acción para agregar una nueva tarea
    addTask: (state, action: PayloadAction<{ description: string }>) => {
      const newTask: Task = {
        id: uuidv4(),
        description: action.payload.description,
        createdAt: new Date().toISOString(),
      };
      state.tasks.push(newTask);
    },
    // Acción para eliminar una tarea
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
  },
});

export const { addTask, removeTask } = tasksSlice.actions;
export default tasksSlice.reducer;