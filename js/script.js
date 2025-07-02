const ESPECIALIDADES = ["Cardiología", "Pediatría", "Traumatología"];
const TIEMPO_POR_TURNO = 15;
let turnos = [];
let proximoTurnoId = 1;

document.getElementById("formTurno").addEventListener("submit", function (e) {
    e.preventDefault();
    registrarTurno();
});

function cargarOpcionesEspecialidad() {
    const select = document.getElementById("especialidad");

    ESPECIALIDADES.forEach((esp, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = esp;
        select.appendChild(option);
    });
}

function registrarTurno() {
    const inputNombre = document.getElementById("nombre");
    const inputEdad = document.getElementById("edad");
    const inputEspecialidad = document.getElementById("especialidad");

    const nombre = inputNombre.value.trim();
    const edad = parseInt(inputEdad.value);
    const especialidadIndex = inputEspecialidad.value;

    // Validación campo nombre vacío
    if (!nombre) {
        fncSweetAlert("error", "El nombre no puede estar vacío.", () => {
            inputNombre.focus(); // ✅ Se ejecuta después del cierre automático
        });
        return;
    }

    // Validación nombre con números

    if (/\d/.test(nombre)) {
        fncSweetAlert("error", "El nombre no debe contener números.", () => {
            inputNombre.focus();
        });
        return;
    }

    // Validación edad

    if (isNaN(edad) || edad <= 0) {
        fncSweetAlert(
            "error",
            "La edad debe ser un número mayor que cero.",
            () => {
                inputEdad.focus(); // ✅ Se ejecuta después del cierre automático
            }
        );
        return;
    }

    // Validación especialidad no seleccionada
    if (especialidadIndex === "") {
        fncSweetAlert("error", "Debe seleccionar una especialidad.", () => {
            inputEspecialidad.focus();
        });
        return;
    }

    // Crear turno
    const nuevoTurno = {
        id: proximoTurnoId++,
        nombre,
        edad,
        especialidad: ESPECIALIDADES[parseInt(especialidadIndex)],
        horaRegistro: new Date().toLocaleTimeString(),
    };

    // Guardar turno
    turnos.push(nuevoTurno);
    guardarTurnosEnLocalStorage();
    agregarTurnoATabla(nuevoTurno);

    // Limpiar formulario
    document.getElementById("formTurno").reset();

    // Mostrar confirmación
    fncSweetAlert("success", `Turno registrado para ${nombre}`, null);
}

function agregarTurnoATabla(turno) {
    const tbody = document.querySelector("#tablaTurnos tbody");
    const fila = document.createElement("tr");
    fila.setAttribute("data-id", turno.id);

    fila.innerHTML = `
    <td>${turno.id}</td>
    <td>${turno.nombre}</td>
    <td>${turno.edad}</td>
    <td>${turno.especialidad}</td>
    <td>${turno.horaRegistro}</td>
    <td>
      <button class="btn btn-sm btn-danger" onclick="eliminarTurno(${turno.id})">Eliminar</button> <!-- NUEVO -->
    </td>
  `;
    tbody.appendChild(fila);
}

function eliminarTurno(id) {
    turnos = turnos.filter((t) => t.id !== id);

    guardarTurnosEnLocalStorage();

    // Elimina la fila de la tabla
    const fila = document.querySelector(
        `#tablaTurnos tbody tr[data-id="${id}"]`
    );
    if (fila) fila.remove();
    fncSweetAlert("success", `Turno #${id} eliminado`, null);

    imprimir("");
}

function guardarTurnosEnLocalStorage() {
    localStorage.setItem("turnos", JSON.stringify(turnos));
}

function cargarTurnosDesdeLocalStorage() {
    const datos = localStorage.getItem("turnos");
    if (datos) {
        turnos = JSON.parse(datos);
        if (turnos.length > 0) {
            proximoTurnoId = Math.max(...turnos.map((t) => t.id)) + 1;
            turnos.forEach((t) => agregarTurnoATabla(t));
        }
    }
}

function calcularTiempoEspera() {
    imprimir("");

    if (turnos.length === 0) {
        fncSweetAlert("info", "No hay turnos registrados", null);
        return;
    }

    let salida = "=== TIEMPOS DE ESPERA ===\n";
    turnos.forEach((turno, index) => {
        const tiempoEspera = index * TIEMPO_POR_TURNO;
        salida += `#${turno.id} - ${turno.nombre} (${turno.edad} años) - ${turno.especialidad}: ${tiempoEspera} mins\n`;
    });
    imprimir(salida);
}

function mostrarEstadisticas() {
    imprimir("");

    const totalTurnos = turnos.length;
    if (totalTurnos === 0) {
        fncSweetAlert("info", "No hay turnos registrados", null);
        return;
    }

    const edadPromedio =
        turnos.reduce((sum, t) => sum + t.edad, 0) / totalTurnos;
    let salida = "=== ESTADÍSTICAS ===\n";
    salida += `Total turnos: ${totalTurnos}\n`;
    salida += `Edad promedio: ${edadPromedio.toFixed(1)} años\n`;

    salida += "\nDistribución por especialidad:\n";
    ESPECIALIDADES.forEach((especialidad) => {
        const count = turnos.filter(
            (t) => t.especialidad === especialidad
        ).length;
        const porcentaje = ((count / totalTurnos) * 100).toFixed(1);
        salida += `${especialidad}: ${count} turnos (${porcentaje}%)\n`;
    });

    imprimir(salida);
}

function imprimir(mensaje) {
    document.getElementById("salida").textContent = mensaje;
}

/*=============================================
  Función Sweetalert
  =============================================*/

function fncSweetAlert(type, text, url) {
    switch (type) {
        /*=============================================
          Cuando ocurre un error
          =============================================*/

        case "error":
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Error",
                showConfirmButton: false,
                timer: 2000,
                text: text,
                didClose: () => {
                    if (typeof url === "function") {
                        url(); // Ejecuta la función de callback después del cierre
                    }
                },
            });

            break;

        /*=============================================
          Cuando es correcto
          =============================================*/

        case "success":
            if (url == null) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    text: text,
                });
            } else {
                Swal.fire({
                    icon: "success",
                    position: "top-end",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    text: text,
                }).then(() => {
                    window.location = url;
                });
            }

            break;

        /*=============================================
          Cuando es info
          =============================================*/

        case "info":
            if (url == null) {
                Swal.fire({
                    position: "top-end",
                    icon: "info",
                    showConfirmButton: false,
                    timer: 1500,
                    text: text,
                });
            } else {
                Swal.fire({
                    icon: "success",
                    position: "top-end",
                    icon: "info",
                    showConfirmButton: false,
                    timer: 1500,
                    text: text,
                }).then(() => {
                    window.location = url;
                });
            }

            break;

        /*=============================================
          Cuando estamos precargando
          =============================================*/

        case "loading":
            Swal.fire({
                position: "top-end",
                allowOutsideClick: false,
                icon: "info",
                text: text,
            });
            Swal.showLoading();

            break;

        /*=============================================
          Cuando necesitamos cerrar la alerta suave
          =============================================*/

        case "close":
            Swal.close();

            break;
    }
}

// Cargar datos al inicio
cargarTurnosDesdeLocalStorage();
cargarOpcionesEspecialidad();
