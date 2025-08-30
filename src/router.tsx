// Configuración de rutas de la aplicación
import { createBrowserRouter } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import TasksPage from './pages/TasksPage/TasksPage';
import ListingPage from './pages/ListingPage/ListingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/tasks',
    element: <TasksPage />,
  },
  {
    path: '/listing',
    element: <ListingPage />,
  },
]);