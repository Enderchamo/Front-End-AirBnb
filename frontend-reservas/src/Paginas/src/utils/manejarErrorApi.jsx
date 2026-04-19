import toast from 'react-hot-toast';

export const mostrarErrorApi = (error, idToast = 'api-error') => {
  // Si el error viene de la respuesta de nuestro backend (ApiError)
  if (error.response && error.response.data) {
    const data = error.response.data;

    // 1. Manejar Errores de Validación (ValidationErrors del DTO)
    if (data.validationErrors || data.ValidationErrors) {
      const errores = data.validationErrors || data.ValidationErrors;
      const listaErrores = Object.values(errores).flat(); // Extrae todos los mensajes en un solo array
      
      toast.error(
        <div>
          <strong>Error de validación:</strong>
          <ul style={{ margin: '8px 0 0 15px', padding: 0, fontSize: '0.9rem', textAlign: 'left' }}>
            {listaErrores.map((err, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>{err}</li>
            ))}
          </ul>
        </div>, 
        { id: idToast, duration: 5000 }
      );
      return;
    }

    // 2. Manejar AppException o errores generales con "Message"
    if (data.message || data.Message) {
      toast.error(data.message || data.Message, { id: idToast });
      return;
    }
  }

  // 3. Fallback si no hay conexión o es un error desconocido
  toast.error("Ocurrió un error al procesar tu solicitud.", { id: idToast });
};