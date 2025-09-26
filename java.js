const urlCandidatos = "https://raw.githubusercontent.com/CesarMCuellarCha/apis/refs/heads/main/candidatos.json";

let eleccionesActivas = localStorage.eleccionesActivas === 'true';
let votos = JSON.parse(localStorage.votos || '{}');

window.onload = function() {
    document.getElementById("txtContador").value = localStorage.contador || "0";
    
    document.getElementById("btnAdmin").onclick = mostrarLogin;
    document.getElementById("btnVerResultados").onclick = mostrarResultados;
    
    document.getElementById("btnIniciarElecciones").onclick = iniciarElecciones;
    document.getElementById("btnCerrarElecciones").onclick = cerrarElecciones;
    
    cargarCandidatos();
    actualizarInterfaz();
    
    configurarEventosTeclado();
    
    configurarInteractividadImagenes();
};

function configurarInteractividadImagenes() {
    const imagenes = document.querySelectorAll('.candidato-img');
    imagenes.forEach(img => {
        console.log('Imagen configurada para votar:', img.alt);
    });
}

function cargarCandidatos() {
    fetch(urlCandidatos)
        .then(res => res.json())
        .then(candidatos => {
            candidatos.push({ nombre: "Voto en Blanco", partido: "Blanco" });
            
            actualizarTarjetasCandidatos(candidatos);
        })
        .catch(error => {
            console.log("Error cargando candidatos:", error);
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

function actualizarTarjetasCandidatos(candidatos) {
    candidatos.forEach((candidato, index) => {
        const id = index + 1;
        const elementoId = id <= 4 ? id.toString() : 'blanco';
        
        if (document.getElementById(`nombre-${elementoId}`)) {
            document.getElementById(`nombre-${elementoId}`).textContent = candidato.nombre;
            document.getElementById(`partido-${elementoId}`).textContent = candidato.partido;
            
            if (!votos[elementoId]) {
                votos[elementoId] = 0;
            }
            
            document.getElementById(`votos-${elementoId}`).textContent = votos[elementoId];
        }
    });
}

function votar(idCandidato) {
    if (!eleccionesActivas) {
        alert(" Las elecciones no están activas");
        return;
    }
    
    const nombreCandidato = document.getElementById(`nombre-${idCandidato}`).textContent;
    
    const imagen = document.querySelector(`img[onclick="votar('${idCandidato}')"]`);
    if (imagen) {
        imagen.style.transform = 'scale(0.95)';
        setTimeout(() => {
            imagen.style.transform = 'scale(1)';
        }, 150);
    }
    
    if (confirm(`¿Confirmar voto por ${nombreCandidato}?`)) {
        let contador = parseInt(localStorage.contador || "0") + 1;
        localStorage.contador = contador;
        document.getElementById("txtContador").value = contador;
        
        votos[idCandidato] = (votos[idCandidato] || 0) + 1;
        localStorage.votos = JSON.stringify(votos);
        
        document.getElementById(`votos-${idCandidato}`).textContent = votos[idCandidato];
        
        if (imagen) {
            imagen.style.boxShadow = '0 0 15px green';
            setTimeout(() => {
                imagen.style.boxShadow = '';
            }, 1000);
        }
        
        alert(` Voto registrado para ${nombreCandidato}`);
    }
}

function mostrarLogin() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("adminActions").style.display = "none";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    
    new bootstrap.Modal(document.getElementById('adminModal')).show();
}

function validarLogin() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    if (user === "admin" && pass === "adso2874057") {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("adminActions").style.display = "block";
    } else {
        alert("Credenciales incorrectas\nUsuario: admin\nContraseña: adso2874057");
    }
}

function iniciarElecciones() {
    console.log("Iniciando elecciones...");
    
    eleccionesActivas = true;
    localStorage.eleccionesActivas = "true";
    
    for (let key in votos) {
        votos[key] = 0;
    }
    localStorage.votos = JSON.stringify(votos);
    localStorage.contador = "0";
    
    document.getElementById("txtContador").value = "0";
    actualizarInterfaz();
    
    for (let i = 1; i <= 4; i++) {
        const boton = document.querySelector(`button[onclick="votar('${i}')"]`);
        const imagen = document.querySelector(`img[onclick="votar('${i}')"]`);
        if (boton) boton.disabled = false;
        if (imagen) imagen.style.cursor = 'pointer';
    }
    
    const botonBlanco = document.querySelector(`button[onclick="votar('blanco')"]`);
    const imagenBlanco = document.querySelector(`img[onclick="votar('blanco')"]`);
    if (botonBlanco) botonBlanco.disabled = false;
    if (imagenBlanco) imagenBlanco.style.cursor = 'pointer';
    
    for (let key in votos) {
        document.getElementById(`votos-${key}`).textContent = "0";
    }
    
    bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
    
    alert(" Elecciones iniciadas correctamente");
}

function cerrarElecciones() {
    eleccionesActivas = false;
    localStorage.eleccionesActivas = "false";
    
    actualizarInterfaz();
    bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
    
    for (let i = 1; i <= 4; i++) {
        const boton = document.querySelector(`button[onclick="votar('${i}')"]`);
        const imagen = document.querySelector(`img[onclick="votar('${i}')"]`);
        if (boton) boton.disabled = true;
        if (imagen) imagen.style.cursor = 'not-allowed';
    }
    
    const botonBlanco = document.querySelector(`button[onclick="votar('blanco')"]`);
    const imagenBlanco = document.querySelector(`img[onclick="votar('blanco')"]`);
    if (botonBlanco) botonBlanco.disabled = true;
    if (imagenBlanco) imagenBlanco.style.cursor = 'not-allowed';
    
    setTimeout(mostrarResultados, 100);
}

function actualizarInterfaz() {
    const estado = document.getElementById("estadoElecciones");
    const mensaje = document.getElementById("mensajeElecciones");
    const btnResultados = document.getElementById("btnVerResultados");
    
    if (eleccionesActivas) {
        estado.textContent = " Elecciones activas";
        estado.className = "badge bg-success";
        mensaje.style.display = "none";
        btnResultados.style.display = "none";
        
        const imagenes = document.querySelectorAll('.candidato-img');
        imagenes.forEach(img => {
            img.style.cursor = 'pointer';
        });
    } else {
        estado.textContent = " Elecciones cerradas";
        estado.className = "badge bg-danger";
        mensaje.style.display = "block";
        btnResultados.style.display = "inline-block";
        
        const imagenes = document.querySelectorAll('.candidato-img');
        imagenes.forEach(img => {
            img.style.cursor = 'not-allowed';
        });
    }
}

function mostrarResultados() {
    const totalVotos = parseInt(localStorage.contador) || 0;
    
    let html = "<h4 class='text-center mb-4'>📊 Resultados de las Elecciones</h4>";
    html += "<div class='table-responsive'><table class='table table-striped'>";
    html += "<thead><tr><th>Candidato</th><th>Partido</th><th>Votos</th><th>Porcentaje</th></tr></thead><tbody>";
    
    
    const resultados = [];
    for (let i = 1; i <= 4; i++) {
        const nombre = document.getElementById(`nombre-${i}`).textContent;
        const partido = document.getElementById(`partido-${i}`).textContent;
        const votosCandidato = votos[i] || 0;
        resultados.push({ nombre, partido, votos: votosCandidato });
    }
    
    
    resultados.push({
        nombre: document.getElementById('nombre-blanco').textContent,
        partido: document.getElementById('partido-blanco').textContent,
        votos: votos['blanco'] || 0
    });
    
    resultados.sort((a, b) => b.votos - a.votos);
    
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

