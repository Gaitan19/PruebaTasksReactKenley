import React from 'react';
import { render } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('debe renderizar el spinner correctamente', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('debe tener la estructura de elementos correcta', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.loading-spinner');
    const circle = container.querySelector('.loading-spinner__circle');
    
    expect(spinner).toBeInTheDocument();
    expect(circle).toBeInTheDocument();
  });

  it('debe aplicar las clases CSS correctas', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.loading-spinner');
    const circle = container.querySelector('.loading-spinner__circle');
    
    expect(spinner).toHaveClass('loading-spinner');
    expect(circle).toHaveClass('loading-spinner__circle');
  });

  it('debe ser un componente sin estado', () => {
    const { rerender } = render(<LoadingSpinner />);
    
    // Re-renderizar varias veces para verificar consistencia
    rerender(<LoadingSpinner />);
    rerender(<LoadingSpinner />);
    
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.loading-spinner');
    
    expect(spinner).toBeInTheDocument();
  });

  it('debe ser accesible', () => {
    const { container } = render(<LoadingSpinner />);
    
    // Verificar que no tenga elementos interactivos que puedan interferir con la accesibilidad
    const focusableElements = container.querySelectorAll('button, input, select, textarea, a[href], [tabindex]');
    expect(focusableElements).toHaveLength(0);
  });
});