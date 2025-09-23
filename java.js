const urlCandidatos = "https://raw.githubusercontent.com/CesarMCuellarCha/apis/refs/heads/main/candidatos.json";

// Estados globales
let eleccionesActivas = localStorage.eleccionesActivas === 'true';
let votos = JSON.parse(localStorage.votos || '{}');

// Cuando carga la página
window.onload = function() {
    // Configurar contador
    document.getElementById("txtContador").value = localStorage.contador || "0";
    
    // Configurar eventos principales
    document.getElementById("btnAdmin").onclick = mostrarLogin;
    document.getElementById("btnVerResultados").onclick = mostrarResultados;
    
    // Conectar botones del modal DIRECTAMENTE
    document.getElementById("btnIniciarElecciones").onclick = iniciarElecciones;
    document.getElementById("btnCerrarElecciones").onclick = cerrarElecciones;
    
    // Cargar candidatos y actualizar la información
    cargarCandidatos();
    actualizarInterfaz();
    
    // Configurar eventos de teclado
    configurarEventosTeclado();
    
    // Configurar interactividad de las imágenes
    configurarInteractividadImagenes();
};

// Configurar efectos hover para las imágenes
function configurarInteractividadImagenes() {
    const imagenes = document.querySelectorAll('.candidato-img');
    imagenes.forEach(img => {
        // Efecto hover ya está en CSS, aquí podríamos agregar más interactividad si se necesita
        console.log('Imagen configurada para votar:', img.alt);
    });
}

// Cargar candidatos y actualizar la información en las tarjetas existentes
function cargarCandidatos() {
    fetch(urlCandidatos)
        .then(res => res.json())
        .then(candidatos => {
            // Agregar voto en blanco
            candidatos.push({ nombre: "Voto en Blanco", partido: "Blanco" });
            
            // Actualizar la información en las tarjetas del HTML
            actualizarTarjetasCandidatos(candidatos);
        })
        .catch(error => {
            console.log("Error cargando candidatos:", error);
            // Datos de ejemplo
            const datosEjemplo = [
                { nombre: "Candidato 1", partido: "Partido A" },
                { nombre: "Candidato 2", partido: "Partido B" },
                { nombre: "Candidato 3", partido: "Partido C" },
                { nombre: "Candidato 4", partido: "Partido D" },
                { nombre: "Voto en Blanco", partido: "Blanco" }
            ];
            actualizarTarjetasCandidatos(datosEjemplo);
        });
}

// Actualizar la información en las tarjetas existentes
function actualizarTarjetasCandidatos(candidatos) {
    candidatos.forEach((candidato, index) => {
        const id = index + 1;
        const elementoId = id <= 4 ? id.toString() : 'blanco';
        
        // Actualizar nombre y partido
        if (document.getElementById(`nombre-${elementoId}`)) {
            document.getElementById(`nombre-${elementoId}`).textContent = candidato.nombre;
            document.getElementById(`partido-${elementoId}`).textContent = candidato.partido;
            
            // Inicializar votos si no existen
            if (!votos[elementoId]) {
                votos[elementoId] = 0;
            }
            
            // Actualizar contador de votos
            document.getElementById(`votos-${elementoId}`).textContent = votos[elementoId];
        }
    });
}

// Función para votar (se llama tanto desde la imagen como desde el botón)
function votar(idCandidato) {
    if (!eleccionesActivas) {
        alert("❌ Las elecciones no están activas");
        return;
    }
    
    const nombreCandidato = document.getElementById(`nombre-${idCandidato}`).textContent;
    
    // Efecto visual al hacer clic
    const imagen = document.querySelector(`img[onclick="votar('${idCandidato}')"]`);
    if (imagen) {
        imagen.style.transform = 'scale(0.95)';
        setTimeout(() => {
            imagen.style.transform = 'scale(1)';
        }, 150);
    }
    
    if (confirm(`¿Confirmar voto por ${nombreCandidato}?`)) {
        // Actualizar contador general
        let contador = parseInt(localStorage.contador || "0") + 1;
        localStorage.contador = contador;
        document.getElementById("txtContador").value = contador;
        
        // Actualizar votos del candidato
        votos[idCandidato] = (votos[idCandidato] || 0) + 1;
        localStorage.votos = JSON.stringify(votos);
        
        // Actualizar interfaz
        document.getElementById(`votos-${idCandidato}`).textContent = votos[idCandidato];
        
        // Efecto de confirmación
        if (imagen) {
            imagen.style.boxShadow = '0 0 15px green';
            setTimeout(() => {
                imagen.style.boxShadow = '';
            }, 1000);
        }
        
        alert(`✅ Voto registrado para ${nombreCandidato}`);
    }
}

// Mostrar modal de login
function mostrarLogin() {
    // Resetear modal
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("adminActions").style.display = "none";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    
    // Mostrar modal
    new bootstrap.Modal(document.getElementById('adminModal')).show();
}

// Validar login
function validarLogin() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    // Credenciales fijas
    if (user === "admin" && pass === "adso2874057") {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("adminActions").style.display = "block";
    } else {
        alert("Credenciales incorrectas\nUsuario: admin\nContraseña: adso2874057");
    }
}

// INICIAR ELECCIONES
function iniciarElecciones() {
    console.log("Iniciando elecciones...");
    
    eleccionesActivas = true;
    localStorage.eleccionesActivas = "true";
    
    // Reiniciar todos los votos
    for (let key in votos) {
        votos[key] = 0;
    }
    localStorage.votos = JSON.stringify(votos);
    localStorage.contador = "0";
    
    // Actualizar interfaz
    document.getElementById("txtContador").value = "0";
    actualizarInterfaz();
    
    // Habilitar botones de votar y hacer las imágenes clickeables
    for (let i = 1; i <= 4; i++) {
        const boton = document.querySelector(`button[onclick="votar('${i}')"]`);
        const imagen = document.querySelector(`img[onclick="votar('${i}')"]`);
        if (boton) boton.disabled = false;
        if (imagen) imagen.style.cursor = 'pointer';
    }
    
    // Habilitar voto en blanco
    const botonBlanco = document.querySelector(`button[onclick="votar('blanco')"]`);
    const imagenBlanco = document.querySelector(`img[onclick="votar('blanco')"]`);
    if (botonBlanco) botonBlanco.disabled = false;
    if (imagenBlanco) imagenBlanco.style.cursor = 'pointer';
    
    // Actualizar contadores de votos
    for (let key in votos) {
        document.getElementById(`votos-${key}`).textContent = "0";
    }
    
    // Cerrar modal
    bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
    
    alert("✅ Elecciones iniciadas correctamente");
}

// Cerrar elecciones
function cerrarElecciones() {
    eleccionesActivas = false;
    localStorage.eleccionesActivas = "false";
    
    actualizarInterfaz();
    bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
    
    // Deshabilitar botones de votar y hacer las imágenes no clickeables
    for (let i = 1; i <= 4; i++) {
        const boton = document.querySelector(`button[onclick="votar('${i}')"]`);
        const imagen = document.querySelector(`img[onclick="votar('${i}')"]`);
        if (boton) boton.disabled = true;
        if (imagen) imagen.style.cursor = 'not-allowed';
    }
    
    // Deshabilitar voto en blanco
    const botonBlanco = document.querySelector(`button[onclick="votar('blanco')"]`);
    const imagenBlanco = document.querySelector(`img[onclick="votar('blanco')"]`);
    if (botonBlanco) botonBlanco.disabled = true;
    if (imagenBlanco) imagenBlanco.style.cursor = 'not-allowed';
    
    // Mostrar resultados
    setTimeout(mostrarResultados, 100);
}

// Actualizar interfaz
function actualizarInterfaz() {
    const estado = document.getElementById("estadoElecciones");
    const mensaje = document.getElementById("mensajeElecciones");
    const btnResultados = document.getElementById("btnVerResultados");
    
    if (eleccionesActivas) {
        estado.textContent = "✅ Elecciones activas";
        estado.className = "badge bg-success";
        mensaje.style.display = "none";
        btnResultados.style.display = "none";
        
        // Hacer imágenes clickeables
        const imagenes = document.querySelectorAll('.candidato-img');
        imagenes.forEach(img => {
            img.style.cursor = 'pointer';
        });
    } else {
        estado.textContent = "❌ Elecciones cerradas";
        estado.className = "badge bg-danger";
        mensaje.style.display = "block";
        btnResultados.style.display = "inline-block";
        
        // Hacer imágenes no clickeables
        const imagenes = document.querySelectorAll('.candidato-img');
        imagenes.forEach(img => {
            img.style.cursor = 'not-allowed';
        });
    }
}

// Mostrar resultados
function mostrarResultados() {
    const totalVotos = parseInt(localStorage.contador) || 0;
    
    let html = "<h4 class='text-center mb-4'>📊 Resultados de las Elecciones</h4>";
    html += "<div class='table-responsive'><table class='table table-striped'>";
    html += "<thead><tr><th>Candidato</th><th>Partido</th><th>Votos</th><th>Porcentaje</th></tr></thead><tbody>";
    
    // Obtener datos de los candidatos
    const resultados = [];
    for (let i = 1; i <= 4; i++) {
        const nombre = document.getElementById(`nombre-${i}`).textContent;
        const partido = document.getElementById(`partido-${i}`).textContent;
        const votosCandidato = votos[i] || 0;
        resultados.push({ nombre, partido, votos: votosCandidato });
    }
    
    // Agregar voto en blanco
    resultados.push({
        nombre: document.getElementById('nombre-blanco').textContent,
        partido: document.getElementById('partido-blanco').textContent,
        votos: votos['blanco'] || 0
    });
    
    // Ordenar por votos (mayor a menor)
    resultados.sort((a, b) => b.votos - a.votos);
    
    // Generar tabla de resultados
    resultados.forEach(candidato => {
        const porcentaje = totalVotos > 0 ? ((candidato.votos / totalVotos) * 100).toFixed(1) : "0.0";
        html += `<tr>
            <td>${candidato.nombre}</td>
            <td>${candidato.partido}</td>
            <td>${candidato.votos}</td>
            <td>${porcentaje}%</td>
        </tr>`;
    });
    
    html += "</tbody></table></div>";
    html += `<div class="text-center mt-3"><strong>Total de votos: ${totalVotos}</strong></div>`;
    
    document.getElementById("resultadosContent").innerHTML = html;
    new bootstrap.Modal(document.getElementById('resultadosModal')).show();
}

// Configurar eventos de teclado
function configurarEventosTeclado() {
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    
    if (username) {
        username.onkeypress = function(e) {
            if (e.key === "Enter") validarLogin();
        };
    }
    
    if (password) {
        password.onkeypress = function(e) {
            if (e.key === "Enter") validarLogin();
        };
    }
}