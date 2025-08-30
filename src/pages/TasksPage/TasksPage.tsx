// Página de gestión de tareas
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { addTask, removeTask } from "../../features/tasks/tasksSlice";
import TaskModal from "../../components/UI/TaskModal/TaskModal";
import "./TasksPage.scss";

const TasksPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const dispatch = useAppDispatch();

  // Función para manejar la creación de una nueva tarea
  const handleAddTask = (description: string) => {
    dispatch(addTask({ description }));
    setShowModal(false);
  };

  // Función para eliminar una tarea
  const handleRemoveTask = (id: string) => {
    dispatch(removeTask(id));
  };

  const renderTasks = () =>
    tasks.map((task) => (
      <div key={task.id} className="task-item">
        <div className="task-item__content">
          <p className="task-item__description">{task.description}</p>
          <span className="task-item__date">
            Creada: {new Date(task.createdAt).toLocaleDateString("es-ES")}
          </span>
        </div>
        <button
          className="task-item__remove-button"
          onClick={() => handleRemoveTask(task.id)}
          aria-label="Eliminar tarea"
        >
          ×
        </button>
      </div>
    ));

  return (
    <div className="container">
      <div className="tasks-page">
        <div className="tasks-page__header">
          <Link to="/" className="tasks-page__back-button">
            ← Volver al inicio
          </Link>
          <h1 className="tasks-page__title">Gestión de Tareas</h1>
          <button
            className="tasks-page__add-button"
            onClick={() => setShowModal(true)}
          >
            + Agregar Nueva Tarea
          </button>
        </div>

        <div className="tasks-page__content">
          {tasks.length === 0 ? (
            <div className="tasks-page__empty">
              <p>No hay tareas creadas. ¡Agrega tu primera tarea!</p>
            </div>
          ) : (
            <div className="tasks-page__list">{renderTasks()}</div>
          )}
        </div>

        {/* Modal para agregar nueva tarea */}
        <TaskModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onAddTask={handleAddTask}
        />
      </div>
    </div>
  );
};

export default TasksPage;
