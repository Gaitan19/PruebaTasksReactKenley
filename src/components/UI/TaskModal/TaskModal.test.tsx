import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskModal from './TaskModal';

describe('TaskModal', () => {
  const mockOnClose = jest.fn();
  const mockOnAddTask = jest.fn();

  const defaultProps = {
    show: true,
    onClose: mockOnClose,
    onAddTask: mockOnAddTask,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('debe renderizar el modal cuando show es true', () => {
      render(<TaskModal {...defaultProps} />);
      
      expect(screen.getByText('Agregar Nueva Tarea')).toBeInTheDocument();
      expect(screen.getByLabelText('Descripción de la tarea')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Escribe la descripción de tu tarea...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Agregar Tarea' })).toBeInTheDocument();
    });

    it('no debe renderizar el modal cuando show es false', () => {
      render(<TaskModal {...defaultProps} show={false} />);
      
      expect(screen.queryByText('Agregar Nueva Tarea')).not.toBeInTheDocument();
    });

    it('debe mostrar el botón de cerrar con el símbolo correcto', () => {
      render(<TaskModal {...defaultProps} />);
      
      expect(screen.getByLabelText('Cerrar modal')).toBeInTheDocument();
      expect(screen.getByText('×')).toBeInTheDocument();
    });
  });

  describe('Interacciones del formulario', () => {
    it('debe permitir escribir en el textarea', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      await user.type(textarea, 'Nueva tarea de prueba');
      
      expect(textarea).toHaveValue('Nueva tarea de prueba');
    });

    it('debe enfocar automáticamente el textarea al abrir', () => {
      render(<TaskModal {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      expect(textarea).toHaveFocus();
    });

    it('debe limpiar el formulario cuando se abre el modal', () => {
      const { rerender } = render(<TaskModal {...defaultProps} show={false} />);
      
      // Renderizar con show=true
      rerender(<TaskModal {...defaultProps} show={true} />);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      expect(textarea).toHaveValue('');
    });
  });

  describe('Validación del formulario', () => {
    it('debe mostrar error cuando se envía descripción vacía', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: 'Agregar Tarea' });
      await user.click(submitButton);
      
      expect(screen.getByText('La descripción es obligatoria')).toBeInTheDocument();
      expect(mockOnAddTask).not.toHaveBeenCalled();
    });

    it('debe mostrar error cuando se envía solo espacios en blanco', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      await user.type(textarea, '   ');
      
      const submitButton = screen.getByRole('button', { name: 'Agregar Tarea' });
      await user.click(submitButton);
      
      expect(screen.getByText('La descripción es obligatoria')).toBeInTheDocument();
      expect(mockOnAddTask).not.toHaveBeenCalled();
    });

    it('debe agregar clase de error al textarea cuando hay error', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      const submitButton = screen.getByRole('button', { name: 'Agregar Tarea' });
      
      await user.click(submitButton);
      
      expect(textarea).toHaveClass('task-modal__textarea--error');
    });

    it('debe limpiar el error cuando el usuario empieza a escribir', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      const submitButton = screen.getByRole('button', { name: 'Agregar Tarea' });
      
      // Generar error
      await user.click(submitButton);
      expect(screen.getByText('La descripción es obligatoria')).toBeInTheDocument();
      
      // Escribir en el textarea
      await user.type(textarea, 'Nueva descripción');
      
      expect(screen.queryByText('La descripción es obligatoria')).not.toBeInTheDocument();
      expect(textarea).not.toHaveClass('task-modal__textarea--error');
    });
  });

  describe('Envío del formulario', () => {
    it('debe llamar onAddTask con la descripción trimmed cuando el formulario es válido', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      await user.type(textarea, '  Tarea con espacios  ');
      
      const submitButton = screen.getByRole('button', { name: 'Agregar Tarea' });
      await user.click(submitButton);
      
      expect(mockOnAddTask).toHaveBeenCalledWith('Tarea con espacios');
      expect(mockOnAddTask).toHaveBeenCalledTimes(1);
    });

    it('debe limpiar el formulario después de enviar', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      await user.type(textarea, 'Nueva tarea');
      
      const submitButton = screen.getByRole('button', { name: 'Agregar Tarea' });
      await user.click(submitButton);
      
      expect(textarea).toHaveValue('');
    });

    it('debe enviar el formulario al presionar Enter en el formulario', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Descripción de la tarea');
      await user.type(textarea, 'Tarea desde teclado');
      
      // Enviar el formulario con Enter
      const form = textarea.closest('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      expect(mockOnAddTask).toHaveBeenCalledWith('Tarea desde teclado');
    });
  });

  describe('Cerrar modal', () => {
    it('debe llamar onClose cuando se hace clic en el botón cerrar', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Cerrar modal');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('debe llamar onClose cuando se hace clic en el botón Cancelar', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('debe llamar onClose cuando se hace clic en el overlay', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      const overlay = document.querySelector('.task-modal__overlay');
      expect(overlay).toBeInTheDocument();
      
      await user.click(overlay!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('debe llamar onClose cuando se presiona Escape', async () => {
      render(<TaskModal {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('no debe llamar onClose cuando se presiona Escape y el modal está cerrado', async () => {
      render(<TaskModal {...defaultProps} show={false} />);
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Limpieza de eventos', () => {
    it('debe limpiar el event listener de teclado al desmontar', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<TaskModal {...defaultProps} />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener las etiquetas ARIA correctas', () => {
      render(<TaskModal {...defaultProps} />);
      
      expect(screen.getByLabelText('Cerrar modal')).toBeInTheDocument();
      expect(screen.getByLabelText('Descripción de la tarea')).toBeInTheDocument();
    });

    it('debe permitir navegación por teclado', async () => {
      const user = userEvent.setup();
      render(<TaskModal {...defaultProps} />);
      
      // El textarea debe estar enfocado inicialmente
      expect(screen.getByLabelText('Descripción de la tarea')).toHaveFocus();
      
      // Tab para navegar a los botones
      await user.tab();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: 'Agregar Tarea' })).toHaveFocus();
    });
  });
});