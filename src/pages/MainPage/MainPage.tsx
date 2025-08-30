// Página principal con navegación a las secciones
import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.scss';

const MainPage: React.FC = () => {
  return (
    <div className="container">
      <div className="main-page">
        <div className="main-page__header">
          <h1 className="main-page__title">Task Management App</h1>
          <p className="main-page__subtitle">
            Bienvenido a la aplicación de gestión de tareas
          </p>
        </div>
        
        <div className="main-page__navigation">
          <Link to="/tasks" className="main-page__button main-page__button--tasks">
            <div className="main-page__button-content">
              <h3>Gestión de Tareas</h3>
              <p>Administra y crea nuevas tareas</p>
            </div>
          </Link>
          
          <Link to="/listing" className="main-page__button main-page__button--listing">
            <div className="main-page__button-content">
              <h3>Listado de Elementos</h3>
              <p>Ver datos desde fuente remota</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainPage;