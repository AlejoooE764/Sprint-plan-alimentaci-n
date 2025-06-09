import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PlanesAlimentacion() {
  const [planes, setPlanes] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: ""
  });

  const fetchPlanes = async () => {
    const res = await axios.get("/api/planes");
    setPlanes(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/planes", form);
    setForm({ nombre: "", descripcion: "", fechaInicio: "", fechaFin: "" });
    fetchPlanes();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/planes/${id}`);
    fetchPlanes();
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Planes de Alimentación</h1>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={form.fechaInicio}
          onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          value={form.fechaFin}
          onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="md:col-span-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Crear Plan
        </button>
      </form>

      <div className="grid gap-4">
        {planes.map((plan) => (
          <div key={plan.id} className="p-4 border rounded shadow-md">
            <h2 className="text-xl font-semibold">{plan.nombre}</h2>
            <p className="text-gray-700">{plan.descripcion}</p>
            <p className="text-sm text-gray-500">
              {new Date(plan.fechaInicio).toLocaleDateString()} -{" "}
              {new Date(plan.fechaFin).toLocaleDateString()}
            </p>
            <button
              onClick={() => handleDelete(plan.id)}
              className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


// import React from "react";

// export default function PlanesAlimentacion() {
//   return (
//     <div>
//       <h1 style={{ color: "green" }}>¡Planes de Alimentación cargado correctamente!</h1>
//     </div>
//   );
// }
