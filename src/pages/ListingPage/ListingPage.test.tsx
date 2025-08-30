import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ListingPage from './ListingPage';
import type { ListingElement } from '../../types/listing';

// Mock de fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Datos de prueba
const mockElements: ListingElement[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    avatar: 'https://example.com/avatar1.jpg',
    createdAt: '2025-01-30T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'María García',
    avatar: 'https://example.com/avatar2.jpg',
    createdAt: '2025-01-30T11:00:00.000Z',
  },
  {
    id: '3',
    name: 'Carlos López',
    createdAt: '2025-01-30T12:00:00.000Z',
  },
];

// Componente wrapper para las pruebas
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock de console.error para evitar ruido en las pruebas
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('ListingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar elementos principales', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockElements,
      });

      renderWithRouter(<ListingPage />);
      
      expect(screen.getByText('Listado de Elementos')).toBeInTheDocument();
      expect(screen.getByText('← Volver al inicio')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '🔄 Actualizar' })).toBeInTheDocument();
    });

    it('debe renderizar el enlace de navegación correctamente', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockElements,
      });

      renderWithRouter(<ListingPage />);
      
      const backLink = screen.getByText('← Volver al inicio');
      expect(backLink).toHaveAttribute('href', '/');
    });
  });

  describe('Estado de carga', () => {
    it('debe mostrar spinner de carga inicialmente', () => {
      mockFetch.mockImplementationOnce(() => new Promise(() => {})); 
      
      renderWithRouter(<ListingPage />);
      
      expect(screen.getByText('Cargando elementos...')).toBeInTheDocument();
      // Verificar que el LoadingSpinner está presente
      expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
    });

    it('debe deshabilitar el botón de actualizar mientras carga', () => {
      mockFetch.mockImplementationOnce(() => new Promise(() => {}));
      
      renderWithRouter(<ListingPage />);
      
      const refreshButton = screen.getByRole('button', { name: '🔄 Actualizar' });
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Carga exitosa de datos', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockElements,
      });
    });

    it('debe mostrar los elementos después de cargar', async () => {
      renderWithRouter(<ListingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('María García')).toBeInTheDocument();
        expect(screen.getByText('Carlos López')).toBeInTheDocument();
      });
    });

    it('debe mostrar las fechas de creación formateadas', async () => {
      renderWithRouter(<ListingPage />);
      
      await waitFor(() => {
        const dateElements = screen.getAllByText('Creado: 30/1/2025');
        expect(dateElements).toHaveLength(3);
      });
    });

    it('debe mostrar los IDs de los elementos', async () => {
      renderWithRouter(<ListingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('ID: 1')).toBeInTheDocument();
        expect(screen.getByText('ID: 2')).toBeInTheDocument();
        expect(screen.getByText('ID: 3')).toBeInTheDocument();
      });
    });

    it('debe renderizar avatares cuando están disponibles', async () => {
      renderWithRouter(<ListingPage />);
      
      await waitFor(() => {
        const avatarImages = screen.getAllByRole('img');
        expect(avatarImages).toHaveLength(2); // Solo Juan y María tienen avatar
        expect(avatarImages[0]).toHaveAttribute('src', 'https://example.com/avatar1.jpg');
        expect(avatarImages[0]).toHaveAttribute('alt', 'Avatar de Juan Pérez');
      });
    });


    it('debe ocultar el estado de carga después de cargar los datos', async () => {
      renderWithRouter(<ListingPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando elementos...')).not.toBeInTheDocument();
      });
    });
  });


  describe('Estado vacío', () => {
    it('debe mostrar mensaje cuando no hay elementos', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      renderWithRouter(<ListingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('No se encontraron elementos.')).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidad de actualizar', () => {
    it('debe recargar datos cuando se hace clic en actualizar', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockElements,
      });

      renderWithRouter(<ListingPage />);
      
      // Esperar a que se carguen los datos iniciales
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });
      
      // Limpiar el mock para ver si se llama de nuevo
      mockFetch.mockClear();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '4', name: 'Nuevo Usuario', createdAt: '2025-01-30T13:00:00.000Z' }],
      });
      
      const refreshButton = screen.getByRole('button', { name: '🔄 Actualizar' });
      await user.click(refreshButton);
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('https://6172cfe5110a740017222e2b.mockapi.io/elements');
    });

    it('debe mostrar estado de carga al actualizar', async () => {
      const user = userEvent.setup();
      
      // Carga inicial exitosa
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockElements,
      });

      renderWithRouter(<ListingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });
      
      // Actualización con promesa que no se resuelve inmediatamente
      mockFetch.mockImplementationOnce(() => new Promise(() => {}));
      
      const refreshButton = screen.getByRole('button', { name: '🔄 Actualizar' });
      await user.click(refreshButton);
      
      expect(screen.getByText('Cargando elementos...')).toBeInTheDocument();
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Manejo de imágenes', () => {
    it('debe manejar errores de carga de avatar', async () => {
      renderWithRouter(<ListingPage />);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockElements,
      });
      
      await waitFor(() => {
        const avatarImage = screen.getByAltText('Avatar de Juan Pérez');
        expect(avatarImage).toBeInTheDocument();
      });
      
      // Simular error de carga de imagen
      const avatarImage = screen.getByAltText('Avatar de Juan Pérez');
      fireEvent.error(avatarImage);
      
      // Verificar que se aplicaron los estilos de fallback
      expect(avatarImage.style.display).toBe('none');
    });
  });

  describe('Llamadas a la API', () => {
    it('debe hacer llamada correcta a la API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockElements,
      });

      renderWithRouter(<ListingPage />);
      
      expect(mockFetch).toHaveBeenCalledWith('https://6172cfe5110a740017222e2b.mockapi.io/elements');
    });

    it('debe hacer una sola llamada inicial', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockElements,
      });

      renderWithRouter(<ListingPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  
});