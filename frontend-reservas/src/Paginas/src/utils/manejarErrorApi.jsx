// src/utils/manejarErrorApi.jsx
import toast from 'react-hot-toast';

/**
 * Manejador global de excepciones para la plataforma.
 * "Mata" el problema de los errores feos extrayendo el mensaje real 
 * enviado por el ExceptionMiddleware de C#.
 */
export const mostrarErrorApi = (error, titulo = 'Error') => {
  // 1. Log detallado en la consola (F12) para que tú como desarrollador veas todo el objeto
  console.error(`[DEBUG] ${titulo}:`, error.response?.data || error);

  let mensajeFinal = "Ocurrió un error inesperado. Por favor, intenta de nuevo.";

  // 2. Si no hay respuesta del servidor (Error de red o servidor apagado)
  if (!error.response) {
    if (error.code === 'ERR_NETWORK') {
      mensajeFinal = "No se pudo conectar con el servidor. Revisa tu conexión a internet o el estado del backend.";
    }
  } else {
    // 3. El servidor respondió. Extraemos los datos según tu estructura ApiResponse.cs
    const data = error.response.data;

    // Buscamos dentro de la propiedad 'error' que define tu ApiError.cs
    const errorBody = data?.error || data?.Error;

    if (errorBody) {
      // Prioridad 1: Mensaje directo (AppException o Exception genérica)
      if (errorBody.message || errorBody.Message) {
        mensajeFinal = errorBody.message || errorBody.Message;
      } 
      
      // Prioridad 2: Errores de validación (FluentValidation)
      // Si el backend envía un diccionario de errores por campo
      const validationErrors = errorBody.errors || errorBody.Errors;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const primeraLlave = Object.keys(validationErrors)[0];
        const listaDeMensajes = validationErrors[primeraLlave];
        mensajeFinal = Array.isArray(listaDeMensajes) ? listaDeMensajes[0] : listaDeMensajes;
      }
    } 
    // Fallback para errores automáticos de ASP.NET Core (como 401 o 415)
    else if (data?.title) {
      mensajeFinal = data.title;
    }
    // Fallback para mensajes planos
    else if (typeof data === 'string') {
      mensajeFinal = data;
    }
  }

  // 4. Mostrar el Toast profesional
  toast.error(mensajeFinal, {
    id: 'api-error-toast', // Evita que se acumulen muchos mensajes iguales si el usuario hace spam-click
    duration: 5000,
    style: {
      border: '1px solid #ff385c', // Rojo estilo Airbnb
      padding: '16px',
      color: '#222',
      fontWeight: '500',
      borderRadius: '12px',
      background: '#fff',
      boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    },
    iconTheme: {
      primary: '#ff385c',
      secondary: '#fff',
    },
  });
};