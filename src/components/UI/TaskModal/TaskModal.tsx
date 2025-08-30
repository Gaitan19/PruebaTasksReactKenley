// Modal para agregar nuevas tareas
import React, { useState, useEffect } from 'react';
import './TaskModal.scss';

interface TaskModalProps {
  show: boolean;
  onClose: () => void;
  onAddTask: (description: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ show, onClose, onAddTask }) => {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Limpiar el formulario al abrir/cerrar el modal
  useEffect(() => {
    if (show) {
      setDescription('');
      setError('');
    }
  }, [show]);

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    onAddTask(description.trim());
    setDescription('');
    setError('');
  };

  // Manejar el cierre con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="task-modal">
      <div className="task-modal__overlay" onClick={onClose} />
      <div className="task-modal__content">
        <div className="task-modal__header">
          <h2 className="task-modal__title">Agregar Nueva Tarea</h2>
          <button 
            className="task-modal__close-button"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-modal__form">
          <div className="task-modal__field">
            <label htmlFor="task-description" className="task-modal__label">
              Descripción de la tarea
            </label>
            <textarea
              id="task-description"
              className={`task-modal__textarea ${error ? 'task-modal__textarea--error' : ''}`}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError('');
              }}
              placeholder="Escribe la descripción de tu tarea..."
              rows={4}
              autoFocus
            />
            {error && <span className="task-modal__error">{error}</span>}
          </div>

          <div className="task-modal__actions">
            <button 
              type="button" 
              className="task-modal__button task-modal__button--cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="task-modal__button task-modal__button--submit"
            >
              Agregar Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;