// Página de listado con datos remotos
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ListingElement } from "../../types/listing";
import LoadingSpinner from "../../components/UI/LoadingSpinner/LoadingSpinner";
import "./ListingPage.scss";
import { API_URL } from "../../config/api";

const ListingPage: React.FC = () => {
  const [elements, setElements] = useState<ListingElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos de la API
  const fetchElements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setElements(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar los datos"
      );
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchElements();
  }, []);

  // Render cuando hay error
  const renderError = (error: string | null, onRetry: () => void) => (
    <div className="listing-page__error">
      <h3>Error al cargar los datos</h3>
      <p>{error}</p>
      <button className="listing-page__retry-button" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );

  // Render cuando no hay elementos
  const renderEmpty = () => (
    <div className="listing-page__empty">
      <p>No se encontraron elementos.</p>
    </div>
  );

  // Render avatar (imagen o fallback)
  const renderAvatar = (avatar: string | undefined, name: string) => (
    <div className="element-card__avatar">
      {avatar && (
        <img
          src={avatar}
          alt={`Avatar de ${name}`}
          className="element-card__avatar-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.nextElementSibling?.classList.remove(
              "element-card__avatar-fallback--hidden"
            );
          }}
        />
      )}
      <div
        className={`element-card__avatar-fallback ${
          avatar ? "element-card__avatar-fallback--hidden" : ""
        }`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    </div>
  );

  // Render fecha de creación
  const renderCreatedAt = (createdAt?: string) => {
    if (!createdAt) return null;
    return (
      <p className="element-card__date">
        Creado: {new Date(createdAt).toLocaleDateString("es-ES")}
      </p>
    );
  };

  const renderElements = () =>
    elements.map((element) => (
      <div key={element.id} className="element-card">
        {renderAvatar(element.avatar, element.name)}
        <div className="element-card__content">
          <h3 className="element-card__name">{element.name}</h3>
          {renderCreatedAt(element.createdAt)}
          <span className="element-card__id">ID: {element.id}</span>
        </div>
      </div>
    ));

  return (
    <div className="container">
      <div className="listing-page">
        <div className="listing-page__header">
          <Link to="/" className="listing-page__back-button">
            ← Volver al inicio
          </Link>
          <h1 className="listing-page__title">Listado de Elementos</h1>
          <button
            className="listing-page__refresh-button"
            onClick={fetchElements}
            disabled={loading}
          >
            🔄 Actualizar
          </button>
        </div>

        <div className="listing-page__content">
          {loading ? (
            <div className="listing-page__loading">
              <LoadingSpinner />
              <p>Cargando elementos...</p>
            </div>
          ) : error ? (
            renderError(error, fetchElements)
          ) : elements.length === 0 ? (
            renderEmpty()
          ) : (
            <div className="listing-page__grid">{renderElements()}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingPage;
