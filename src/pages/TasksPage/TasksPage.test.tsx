import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import TasksPage from './TasksPage';
import tasksReducer from '../../features/tasks/tasksSlice';
import type { Task } from '../../types/task';

// Mock de uuid para hacer los tests predecibles
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

// Componente wrapper para los tests
const createTestStore = (initialTasks: Task[] = []) => {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
    },
    preloadedState: {
      tasks: {
        tasks: initialTasks,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement, initialTasks: Task[] = []) => {
  const store = createTestStore(initialTasks);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    ),
    store,
  };
};

const mockTasks: Task[] = [
  {
    id: '1',
    description: 'Primera tarea de prueba',
    createdAt: '2025-01-30T10:00:00.000Z',
  },
  {
    id: '2',
    description: 'Segunda tarea de prueba',
    createdAt: '2025-01-30T11:00:00.000Z',
  },
];

describe('TasksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado básico', () => {
    it('debe renderizar todos los elementos principales', () => {
      renderWithProviders(<TasksPage />);
      
      expect(screen.getByText('Gestión de Tareas')).toBeInTheDocument();
      expect(screen.getByText('← Volver al inicio')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '+ Agregar Nueva Tarea' })).toBeInTheDocument();
    });

    it('debe renderizar el enlace de navegación correctamente', () => {
      renderWithProviders(<TasksPage />);
      
      const backLink = screen.getByText('← Volver al inicio');
      expect(backLink).toHaveAttribute('href', '/');
    });
  });

  describe('Estado vacío', () => {
    it('debe mostrar mensaje cuando no hay tareas', () => {
      renderWithProviders(<TasksPage />);
      
      expect(screen.getByText('No hay tareas creadas. ¡Agrega tu primera tarea!')).toBeInTheDocument();
    });

    it('no debe mostrar la lista de tareas cuando está vacía', () => {
      renderWithProviders(<TasksPage />);
      
      expect(screen.queryByTestId('tasks-list')).not.toBeInTheDocument();
    });
  });

  describe('Lista de tareas', () => {
    it('debe renderizar las tareas existentes', () => {
      renderWithProviders(<TasksPage />, mockTasks);
      
      expect(screen.getByText('Primera tarea de prueba')).toBeInTheDocument();
      expect(screen.getByText('Segunda tarea de prueba')).toBeInTheDocument();
    });

    it('debe mostrar las fechas de creación formateadas', () => {
      renderWithProviders(<TasksPage />, mockTasks);
      
      const dateElements = screen.getAllByText('Creada: 30/1/2025');
      expect(dateElements).toHaveLength(2);
    });

    it('debe mostrar botones de eliminar para cada tarea', () => {
      renderWithProviders(<TasksPage />, mockTasks);
      
      const deleteButtons = screen.getAllByLabelText('Eliminar tarea');
      expect(deleteButtons).toHaveLength(2);
    });

    it('no debe mostrar el mensaje de estado vacío cuando hay tareas', () => {
      renderWithProviders(<TasksPage />, mockTasks);
      
      expect(screen.queryByText('No hay tareas creadas. ¡Agrega tu primera tarea!')).not.toBeInTheDocument();
    });
  });

  describe('Modal de nueva tarea', () => {
    it('debe abrir el modal cuando se hace clic en Agregar Nueva Tarea', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TasksPage />);
      
      const addButton = screen.getByRole('button', { name: '+ Agregar Nueva Tarea' });
      await user.click(addButton);
      
      expect(screen.getByText('Agregar Nueva Tarea')).toBeInTheDocument();
      expect(screen.getByLabelText('Descripción de la tarea')).toBeInTheDocument();
    });

    it('no debe mostrar el modal inicialmente', () => {
      renderWithProviders(<TasksPage />);
      
      expect(screen.queryByText('Agregar Nueva Tarea')).not.toBeInTheDocument();
    });

    it('debe cerrar el modal cuando se cancela', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TasksPage />);
      
      // Abrir modal
      const addButton = screen.getByRole('button', { name: '+ Agregar Nueva Tarea' });
      await user.click(addButton);
      
      // Cerrar modal
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Agregar Nueva Tarea')).not.toBeInTheDocument();
      });
    });
  });

  describe('Agregar nuevas tareas', () => {
    it('debe agregar una nueva tarea y cerrar el modal', async () => {
      const user = userEvent.setup();
      const { store } = renderWithProviders(<TasksPage />);
      
      // Abrir modal
      const addButton = screen.getByRole('button', { name: '+ Agregar Nueva Tarea' });
      await user.click(addButton);
      
      // Escribir descripción
      const textarea = screen.getByLabelText('Descripción de la tarea');
      await user.type(textarea, 'Nueva tarea desde test');
      
      // Enviar formulario
      const submitButton = screen.getByRole('button', { name: 'Agregar Tarea' });
      await user.click(submitButton);
      
      // Verificar que se agregó la tarea al store
      const state = store.getState();
      expect(state.tasks.tasks).toHaveLength(1);
      expect(state.tasks.tasks[0].description).toBe('Nueva tarea desde test');
      
      // Verificar que el modal se cerró
      await waitFor(() => {
        expect(screen.queryByText('Agregar Nueva Tarea')).not.toBeInTheDocument();
      });
    });

    it('debe actualizar la vista con la nueva tarea', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TasksPage />);
      
      // Inicialmente debe mostrar estado vacío
      expect(screen.getByText('No hay tareas creadas. ¡Agrega tu primera tarea!')).toBeInTheDocument();
      
      // Agregar nueva tarea
      const addButton = screen.getByRole('button', { name: '+ Agregar Nueva Tarea' });
      await user.click(addButton);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      await user.type(textarea, 'Primera tarea agregada');
      
      const submitButton = screen.getByRole('button', { name: 'Agregar Tarea' });
      await user.click(submitButton);
      
      // Verificar que se muestra la tarea en la vista
      await waitFor(() => {
        expect(screen.getByText('Primera tarea agregada')).toBeInTheDocument();
        expect(screen.queryByText('No hay tareas creadas. ¡Agrega tu primera tarea!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Eliminar tareas', () => {
    it('debe eliminar una tarea cuando se hace clic en el botón de eliminar', async () => {
      const user = userEvent.setup();
      const { store } = renderWithProviders(<TasksPage />, mockTasks);
      
      // Verificar estado inicial
      expect(store.getState().tasks.tasks).toHaveLength(2);
      expect(screen.getByText('Primera tarea de prueba')).toBeInTheDocument();
      
      // Eliminar primera tarea
      const deleteButtons = screen.getAllByLabelText('Eliminar tarea');
      await user.click(deleteButtons[0]);
      
      // Verificar que se eliminó del store
      const state = store.getState();
      expect(state.tasks.tasks).toHaveLength(1);
      expect(state.tasks.tasks[0].description).toBe('Segunda tarea de prueba');
      
      // Verificar que se actualizó la vista
      await waitFor(() => {
        expect(screen.queryByText('Primera tarea de prueba')).not.toBeInTheDocument();
        expect(screen.getByText('Segunda tarea de prueba')).toBeInTheDocument();
      });
    });

    it('debe mostrar estado vacío después de eliminar todas las tareas', async () => {
      const user = userEvent.setup();
      const singleTask: Task[] = [{
        id: '1',
        description: 'Única tarea',
        createdAt: '2025-01-30T10:00:00.000Z',
      }];
      
      renderWithProviders(<TasksPage />, singleTask);
      
      // Verificar que hay una tarea
      expect(screen.getByText('Única tarea')).toBeInTheDocument();
      
      // Eliminar la única tarea
      const deleteButton = screen.getByLabelText('Eliminar tarea');
      await user.click(deleteButton);
      
      // Verificar que se muestra estado vacío
      await waitFor(() => {
        expect(screen.getByText('No hay tareas creadas. ¡Agrega tu primera tarea!')).toBeInTheDocument();
        expect(screen.queryByText('Única tarea')).not.toBeInTheDocument();
      });
    });

   
  });

  describe('Integración Redux', () => {
    it('debe reflejar cambios del store en tiempo real', async () => {
      const user = userEvent.setup();
      const { store } = renderWithProviders(<TasksPage />);
      
      // Agregar tarea
      const addButton = screen.getByRole('button', { name: '+ Agregar Nueva Tarea' });
      await user.click(addButton);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      await user.type(textarea, 'Tarea de integración');
      
      const submitButton = screen.getByRole('button', { name: 'Agregar Tarea' });
      await user.click(submitButton);
      
      // Verificar sincronización con el store
      await waitFor(() => {
        const state = store.getState();
        expect(state.tasks.tasks).toHaveLength(1);
        expect(screen.getByText('Tarea de integración')).toBeInTheDocument();
      });
    });

    
  });

  
});