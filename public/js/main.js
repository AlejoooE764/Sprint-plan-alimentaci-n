document.addEventListener("DOMContentLoaded", cargarPlanes);
document.getElementById("formPlan").addEventListener("submit", crearPlan);

function agregarComida() {
  const contenedor = document.getElementById("comidasContainer");
  const div = document.createElement("div");
  div.classList.add("comida");
  div.innerHTML = `
    <select class="tipo">
      <option value="desayuno">Desayuno</option>
      <option value="almuerzo">Almuerzo</option>
      <option value="cena">Cena</option>
      <option value="snack">Snack</option>
    </select>
    <input type="time" class="hora" />
    <input type="text" class="descripcion" placeholder="Descripción de la comida" required />
  `;
  contenedor.appendChild(div);
}

async function cargarPlanes() {
  const res = await fetch("/api/planes");
  const planes = await res.json();
  const lista = document.getElementById("listaPlanes");
  lista.innerHTML = "";

  planes.forEach(plan => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${plan.nombre}</strong> (${plan.fechaInicio.substring(0,10)} a ${plan.fechaFin.substring(0,10)})
      <br/>${plan.descripcion || "Sin descripción"}<br/>
      <ul>
        ${plan.comidas.map(c => `<li>${c.tipo} (${c.hora || "sin hora"}): ${c.descripcion}</li>`).join("")}
      </ul>
      <button onclick="eliminarPlan(${plan.id})">Eliminar</button>
    `;
    lista.appendChild(li);
  });
}

async function crearPlan(e) {
  e.preventDefault();

  const comidasDOM = document.querySelectorAll(".comida");
  const comidas = Array.from(comidasDOM).map(div => ({
    tipo: div.querySelector(".tipo").value,
    hora: div.querySelector(".hora").value,
    descripcion: div.querySelector(".descripcion").value,
  }));

  const data = {
    nombre: document.getElementById("nombre").value,
    descripcion: document.getElementById("descripcion").value,
    fechaInicio: document.getElementById("fechaInicio").value,
    fechaFin: document.getElementById("fechaFin").value,
    comidas
  };

  await fetch("/api/planes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  e.target.reset();
  document.getElementById("comidasContainer").innerHTML = ""; // reset comidas
  agregarComida(); // agregar una nueva vacía
  cargarPlanes();
}

async function eliminarPlan(id) {
  await fetch(`/api/planes/${id}`, { method: "DELETE" });
  cargarPlanes();
}
