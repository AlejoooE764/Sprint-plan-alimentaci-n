document.addEventListener('DOMContentLoaded', () => {
    const plansListDiv = document.getElementById('plans-list');
    const createPlanForm = document.getElementById('create-plan-form');
    const createMessageDiv = document.getElementById('create-message');

    const API_URL = '/api/planes';

    // Función para mostrar mensajes
    function showMessage(element, message, type = 'success') {
        element.textContent = message;
        element.className = type; // Para aplicar estilos CSS según el tipo
        setTimeout(() => {
            element.textContent = '';
            element.className = '';
        }, 3000);
    }

    // Función para obtener y mostrar los planes
    async function fetchPlans() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const plans = await response.json();

            plansListDiv.innerHTML = ''; // Limpiar lista actual

            if (plans.length === 0) {
                plansListDiv.innerHTML = '<p>No hay planes de alimentación registrados.</p>';
                return;
            }

            const ul = document.createElement('ul');
            plans.forEach(plan => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${plan.nombre}</strong> (ID: ${plan.id})<br>
                    Usuario ID: ${plan.usuarioId} (Nombre: ${plan.usuario ? plan.usuario.nombre : 'N/A'})<br>
                    Descripción: ${plan.descripcion || 'N/A'}<br>
                    Inicio: ${new Date(plan.fechaInicio).toLocaleDateString()} - Fin: ${new Date(plan.fechaFin).toLocaleDateString()}<br>
                    Comidas: ${plan.comidas ? plan.comidas.length : 0}
                `;
                // Aquí podrías añadir un botón para eliminar o editar si implementas esas funciones
                ul.appendChild(li);
            });
            plansListDiv.appendChild(ul);
        } catch (error) {
            console.error('Error al cargar los planes:', error);
            plansListDiv.innerHTML = '<p>Error al cargar los planes. Intente más tarde.</p>';
            showMessage(plansListDiv, `Error al cargar planes: ${error.message}`, 'error');
        }
    }

    // Función para manejar la creación de un nuevo plan
    async function handleCreatePlanSubmit(event) {
        event.preventDefault();

        const formData = new FormData(createPlanForm);
        const planData = {
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            fechaInicio: formData.get('fechaInicio'),
            fechaFin: formData.get('fechaFin'),
            usuarioId: parseInt(formData.get('usuarioId'), 10)
        };

        // Validación simple (Joi ya valida en backend, pero una básica en frontend es buena UX)
        if (!planData.nombre || !planData.fechaInicio || !planData.fechaFin || !planData.usuarioId) {
            showMessage(createMessageDiv, 'Por favor, complete todos los campos requeridos.', 'error');
            return;
        }
        if (new Date(planData.fechaFin) <= new Date(planData.fechaInicio)) {
            showMessage(createMessageDiv, 'La fecha de fin debe ser posterior a la fecha de inicio.', 'error');
            return;
        }


        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(planData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error HTTP: ${response.status}`);
            }

            const newPlan = await response.json();
            showMessage(createMessageDiv, `Plan "${newPlan.nombre}" creado exitosamente!`, 'success');
            createPlanForm.reset(); // Limpiar el formulario
            fetchPlans(); // Recargar la lista de planes
        } catch (error) {
            console.error('Error al crear el plan:', error);
            showMessage(createMessageDiv, `Error al crear el plan: ${error.message}`, 'error');
        }
    }

    // Event Listeners
    if (createPlanForm) {
        createPlanForm.addEventListener('submit', handleCreatePlanSubmit);
    }

    // Carga inicial de planes
    fetchPlans();
});
