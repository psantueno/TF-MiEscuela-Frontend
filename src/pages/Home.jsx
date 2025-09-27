import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom'
import '../index.css';
import '../App.css';

export default function Home() {
  const navigate = useNavigate(); // Hook de React Router

  const handleLoginClick = () => {
    navigate('/login'); // Redirige a /login
  };

  return (
    <div className="home-container p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        La Plataforma que Une a tu Comunidad Educativa
      </h1>

      <p className="mb-4">
        Nuestra plataforma es la <strong>solución integral</strong> diseñada para revolucionar la <strong>comunicación</strong> y la <strong>gestión académica</strong> entre <strong>padres, alumnos, docentes y directivos</strong>.
      </p>

      <p className="mb-4">
        Deje atrás las notas dispersas y las llamadas a destiempo. <strong>Centralice todo en un solo lugar:</strong>
      </p>

      <ul className="list-disc pl-6 mb-4">
        <li>
          <strong>Rendimiento y Seguimiento:</strong> Consulte notas y el <strong>avance detallado</strong> de cada alumno en tiempo real.
        </li>
        <li>
          <strong>Asistencia y Tareas:</strong> Gestione la asistencia y distribuya <strong>tareas</strong> y <strong>material de estudio</strong> de manera eficiente.
        </li>
        <li>
          <strong>Comunicación Directa:</strong> Facilite la interacción con <strong>chats internos</strong> y envíe <strong>notificaciones de eventos</strong> importantes.
        </li>
      </ul>

      <p className="mb-4">
        Transformamos la educación, facilitando una <strong>colaboración perfecta</strong> para que todos los actores estén informados y enfocados en el éxito del estudiante.
      </p>

      <div className="text-center">
        {/* Botón de login */}
        <button
          className="text-sm underline hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleLoginClick}
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}
