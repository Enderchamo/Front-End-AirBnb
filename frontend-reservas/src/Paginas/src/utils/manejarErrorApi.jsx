import toast from 'react-hot-toast';

export const mostrarErrorApi = (error, mensajePorDefecto = "Ocurrió un error inesperado.") => {
    console.error("🔍 Error interceptado en utilidades:", error?.response?.data || error.message);

    // 1. Fallo de red (Servidor caído)
    if (!error.response) {
        toast.error("No hay conexión con el servidor 🔌");
        return;
    }

    const data = error.response.data;
    let mensajesExtraidos = [];

    // 2. BUSCAR ERRORES ESPECÍFICOS PRIMERO (validationErrors)
    // Caso A: Tu formato actual (data.error.validationErrors)
    if (data?.error?.validationErrors) {
        mensajesExtraidos = Object.values(data.error.validationErrors).flat();
    } 
    // Caso B: Formato clásico de .NET (data.errors)
    else if (data?.errors) {
        mensajesExtraidos = Object.values(data.errors).flat();
    }

    // Si encontró errores detallados ("El precio debe ser mayor a 0"), los muestra y termina.
    if (mensajesExtraidos.length > 0) {
        mensajesExtraidos.forEach(msg => toast.error(String(msg), { duration: 5000 }));
        return;
    }

    // 3. BUSCAR MENSAJE GENERAL SI NO HUBO DETALLES
    // Extrae el mensaje de cualquier lugar donde .NET suele esconderlo
    const mensajePrincipal = data?.error?.message || data?.mensaje || data?.message || data?.title;

    if (mensajePrincipal && typeof mensajePrincipal === 'string') {
        // Filtro estético: Evitamos mostrar el texto genérico aburrido si podemos evitarlo
        if (mensajePrincipal !== "Uno o más campos tienen errores de validación.") {
            toast.error(mensajePrincipal, { duration: 5000 });
            return;
        }
    }

    // 4. SI ES UN TEXTO PLANO
    if (typeof data === 'string' && data.trim() !== '') {
        toast.error(data, { duration: 5000 });
        return;
    }

    // 5. FALLBACK ABSOLUTO (Si .NET manda algo indescifrable)
    toast.error(mensajePorDefecto);
};