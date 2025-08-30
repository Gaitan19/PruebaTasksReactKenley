// Componente de carga animado
import React from 'react';
import './LoadingSpinner.scss';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner">
      <div className="loading-spinner__circle"></div>
    </div>
  );
};

export default LoadingSpinner;