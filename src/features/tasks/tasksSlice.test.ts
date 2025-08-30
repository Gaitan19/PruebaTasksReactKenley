/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer, { addTask, removeTask } from './tasksSlice';

// Mock de uuid para hacer los tests predecibles
let uuidCounter = 0;
jest.mock('uuid', () => ({
  v4: jest.fn(() => `test-uuid-${++uuidCounter}`),
}));

// Mock de Date para hacer los tests predecibles
const mockDate = new Date('2025-01-30T10:00:00.000Z');
const originalDate = Date;
const originalDateNow = Date.now;

beforeAll(() => {
  // Mock Date constructor
  global.Date = jest.fn(() => mockDate) as any;
  // Mock Date.now
  global.Date.now = jest.fn(() => mockDate.getTime());
  // Copy static methods
  Object.setPrototypeOf(global.Date, originalDate);
  Object.getOwnPropertyNames(originalDate).forEach(property => {
    if (property !== 'now' && property !== 'length' && property !== 'prototype' && property !== 'name') {
      (global.Date as any)[property] = (originalDate as any)[property];
    }
  });
});

afterAll(() => {
  global.Date = originalDate;
  global.Date.now = originalDateNow;
});

describe('tasksSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Reset UUID counter
    uuidCounter = 0;
    store = configureStore({
      reducer: {
        tasks: tasksReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('debe tener un array vacío de tareas como estado inicial', () => {
      const state = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      expect(state.tasks.tasks).toEqual([]);
    });
  });

  describe('addTask action', () => {
    it('debe agregar una nueva tarea con ID único y timestamp', () => {
      const description = 'Nueva tarea de prueba';
      
      store.dispatch(addTask({ description }));
      
      const state = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      const addedTask = state.tasks.tasks[0];
      
      expect(state.tasks.tasks).toHaveLength(1);
      expect(addedTask).toEqual({
        id: 'test-uuid-1',
        description: 'Nueva tarea de prueba',
        createdAt: mockDate.toISOString(),
      });
    });

    it('debe agregar múltiples tareas manteniendo el orden', () => {
      const descriptions = ['Primera tarea', 'Segunda tarea', 'Tercera tarea'];
      
      descriptions.forEach(description => {
        store.dispatch(addTask({ description }));
      });
      
      const state = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      expect(state.tasks.tasks).toHaveLength(3);
      expect(state.tasks.tasks.map(task => task.description)).toEqual(descriptions);
    });

    it('debe manejar descripciones con espacios y caracteres especiales', () => {
      const description = '  Tarea con espacios y símbolos @#$%  ';
      
      store.dispatch(addTask({ description }));
      
      const state = store.getState()as { tasks: ReturnType<typeof tasksReducer> };
      expect(state.tasks.tasks[0].description).toBe(description);
    });
  });

  describe('removeTask action', () => {
    beforeEach(() => {
      // Agregar algunas tareas para las pruebas de eliminación
      store.dispatch(addTask({ description: 'Primera tarea' }));
      store.dispatch(addTask({ description: 'Segunda tarea' }));
      store.dispatch(addTask({ description: 'Tercera tarea' }));
    });

    it('debe eliminar la tarea correcta por ID', () => {
      const state = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      const taskToRemove = state.tasks.tasks[1];
      
      store.dispatch(removeTask(taskToRemove.id));
      
      const newState = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      expect(newState.tasks.tasks).toHaveLength(2);
      expect(newState.tasks.tasks.find(task => task.id === taskToRemove.id)).toBeUndefined();
      expect(newState.tasks.tasks.map(task => task.description)).toEqual(['Primera tarea', 'Tercera tarea']);
    });

    it('debe mantener las tareas restantes sin modificar', () => {
      const state = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      const firstTask = state.tasks.tasks[0];
      const lastTask = state.tasks.tasks[2];
      
      store.dispatch(removeTask(state.tasks.tasks[1].id));
      
      const newState = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      expect(newState.tasks.tasks[0]).toEqual(firstTask);
      expect(newState.tasks.tasks[1]).toEqual(lastTask);
    });

    it('no debe modificar el estado si el ID no existe', () => {
      const stateBefore = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      
      store.dispatch(removeTask('id-inexistente'));
      
      const stateAfter = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      expect(stateAfter.tasks.tasks).toEqual(stateBefore.tasks.tasks);
    });

    it('debe manejar la eliminación de todas las tareas', () => {
      const state = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      
      state.tasks.tasks.forEach(task => {
        store.dispatch(removeTask(task.id));
      });
      
      const finalState = store.getState() as { tasks: ReturnType<typeof tasksReducer> };
      expect(finalState.tasks.tasks).toEqual([]);
    });
  });

  describe('Integración de acciones', () => {
    it('debe permitir agregar y eliminar tareas de manera intercalada', () => {
      // Agregar primera tarea
      store.dispatch(addTask({ description: 'Tarea 1' }));
      expect((store.getState() as { tasks: ReturnType<typeof tasksReducer> }).tasks.tasks).toHaveLength(1);
      
      // Agregar segunda tarea
      store.dispatch(addTask({ description: 'Tarea 2' }));
      expect((store.getState() as { tasks: ReturnType<typeof tasksReducer> }).tasks.tasks).toHaveLength(2);
      
      // Eliminar primera tarea
      const firstTaskId = (store.getState() as { tasks: ReturnType<typeof tasksReducer> }).tasks.tasks[0].id;
      store.dispatch(removeTask(firstTaskId));
      expect((store.getState() as { tasks: ReturnType<typeof tasksReducer> }).tasks.tasks).toHaveLength(1);
      expect((store.getState() as { tasks: ReturnType<typeof tasksReducer> }).tasks.tasks[0].description).toBe('Tarea 2');
      
      // Agregar tercera tarea
      store.dispatch(addTask({ description: 'Tarea 3' }));
      expect((store.getState() as { tasks: ReturnType<typeof tasksReducer> }).tasks.tasks).toHaveLength(2);
      expect((store.getState() as { tasks: ReturnType<typeof tasksReducer> }).tasks.tasks.map(task => task.description)).toEqual(['Tarea 2', 'Tarea 3']);
    });
  });
});