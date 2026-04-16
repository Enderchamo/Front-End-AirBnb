import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ConfirmarCuenta() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Extraemos el email y token de la URL del correo
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    
    const [mensaje, setMensaje] = useState('Confirmando tu cuenta, por favor espera...');
    const [estado, setEstado] = useState('cargando'); // 'cargando', 'exito', 'error'

    useEffect(() => {
        if (email && token) {
            // 👇 CAMBIA ESTA URL por la de tu backend (ej. http://localhost:5085) 👇
            const urlBackend = `http://localhost:5085/api/Usuarios/confirmar?email=${email}&token=${token}`;
            
            axios.post(urlBackend)
                .then(response => {
                    setEstado('exito');
                    setMensaje("¡Cuenta confirmada exitosamente! Ya puedes iniciar sesión en la plataforma.");
                })
                .catch(error => {
                    setEstado('error');
                    setMensaje(error.response?.data?.error || "Error al confirmar la cuenta. El enlace podría haber expirado.");
                });
        } else {
            setEstado('error');
            setMensaje("Enlace de confirmación inválido.");
        }
    }, [email, token]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: '#FF5A5F' }}>Plataforma de Reservas 🏕️</h1>
            
            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', maxWidth: '400px' }}>
                <h3>{estado === 'cargando' ? '⏳' : estado === 'exito' ? '✅' : '❌'}</h3>
                <p style={{ fontSize: '18px', color: '#333' }}>{mensaje}</p>
                
                {estado === 'exito' && (
                    <button 
                        onClick={() => navigate('/')} 
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#FF5A5F', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Ir al Inicio
                    </button>
                )}
            </div>
        </div>
    );
}