/**
 * NutriFit Frontend Main Script (New HTML Structure)
 * Handles API interactions, DOM manipulation, and event listening for plan management.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selections ---
    const uiElements = {
        formPlan: document.getElementById('formPlan'),
        nombrePlanInput: document.getElementById('nombre'),
        descripcionPlanInput: document.getElementById('descripcionPlan'),
        fechaInicioInput: document.getElementById('fechaInicio'),
        fechaFinInput: document.getElementById('fechaFin'),
        usuarioIdInput: document.getElementById('usuarioId'), // Added for the new field
        comidasContainer: document.getElementById('comidasContainer'),
        addComidaBtn: document.getElementById('addComidaBtn'),
        formPlanMessage: document.getElementById('formPlanMessage'),
        listaPlanes: document.getElementById('listaPlanes'),
        listaPlanesLoading: document.getElementById('listaPlanesLoading'),
        listaPlanesMessage: document.getElementById('listaPlanesMessage'),
    };

    const API_BASE_URL = '/api/planes';
    let comidaIndex = 0; // Counter for unique IDs for meal fields

    // Initialize with one meal form if #comidasContainer is empty or update existing one
    if (uiElements.comidasContainer.children.length === 0) {
        addComidaField();
    } else {
        // If there's already a fieldset (from HTML), make sure its index is 0 and update its elements
        const firstComidaField = uiElements.comidasContainer.querySelector('.comida');
        if (firstComidaField) {
            comidaIndex = 0; // Reset counter because we are using the one from HTML
            updateComidaFieldAttributes(firstComidaField, 0);
            // Ensure remove button is hidden if it's the only one, or visible if not (though initially it should be only one)
            const removeBtn = firstComidaField.querySelector('.remove-comida-btn');
            if (removeBtn) removeBtn.style.display = 'none';
        }
    }

    // --- Utility Functions ---
    function showUIMessage(element, message, type = 'success') {
        if (!element) {
            console.warn('Message element not found for:', message);
            return;
        }
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
        setTimeout(() => {
            if (element) {
                element.textContent = '';
                element.style.display = 'none';
            }
        }, 5000);
    }

    // --- Meal Management Functions ---
    function updateComidaFieldAttributes(fieldset, index) {
        fieldset.dataset.comidaIndex = index;
        fieldset.querySelector('legend').textContent = `Comida ${index + 1}`;

        const tipoSelect = fieldset.querySelector('.tipoComida');
        const horaInput = fieldset.querySelector('.horaComida');
        const descripcionInput = fieldset.querySelector('.descripcionComida');

        tipoSelect.id = `tipoComida-${index}`;
        tipoSelect.name = `comidas[${index}][tipo]`;
        fieldset.querySelector(`label[for^="tipoComida-"]`).htmlFor = `tipoComida-${index}`;

        horaInput.id = `horaComida-${index}`;
        horaInput.name = `comidas[${index}][hora]`;
        fieldset.querySelector(`label[for^="horaComida-"]`).htmlFor = `horaComida-${index}`;

        descripcionInput.id = `descripcionComida-${index}`;
        descripcionInput.name = `comidas[${index}][descripcion]`;
        fieldset.querySelector(`label[for^="descripcionComida-"]`).htmlFor = `descripcionComida-${index}`;

        const removeBtn = fieldset.querySelector('.remove-comida-btn');
        if(removeBtn) removeBtn.dataset.comidaIndex = index;
    }

    function addComidaField() {
        comidaIndex = uiElements.comidasContainer.children.length; // Determine new index based on current children
        const newComidaField = uiElements.comidasContainer.children[0].cloneNode(true);

        updateComidaFieldAttributes(newComidaField, comidaIndex);

        // Clear input values in the cloned field
        newComidaField.querySelector('.tipoComida').value = 'desayuno';
        newComidaField.querySelector('.horaComida').value = '';
        newComidaField.querySelector('.descripcionComida').value = '';

        const removeBtn = newComidaField.querySelector('.remove-comida-btn');
        if (removeBtn) removeBtn.style.display = 'inline-block'; // Show remove button on new fields

        uiElements.comidasContainer.appendChild(newComidaField);

        // Ensure the first meal's remove button is visible if there's more than one meal
        if (uiElements.comidasContainer.children.length > 1) {
            const firstRemoveBtn = uiElements.comidasContainer.children[0].querySelector('.remove-comida-btn');
            if (firstRemoveBtn) firstRemoveBtn.style.display = 'inline-block';
        }
         // Increment comidaIndex for the next potential add, AFTER using the current length as the index
        // comidaIndex++; // This global counter might not be needed if we always count children
    }

    function removeComidaField(indexToRemove) {
        const fieldToRemove = uiElements.comidasContainer.querySelector(`fieldset[data-comida-index="${indexToRemove}"]`);
        if (fieldToRemove) {
            fieldToRemove.remove();
        }
        // Re-index remaining fields
        const remainingFields = uiElements.comidasContainer.querySelectorAll('.comida');
        remainingFields.forEach((field, newIndex) => {
            updateComidaFieldAttributes(field, newIndex);
        });
        // Hide remove button if only one meal field remains
        if (uiElements.comidasContainer.children.length === 1) {
            const lastRemoveBtn = uiElements.comidasContainer.children[0].querySelector('.remove-comida-btn');
            if (lastRemoveBtn) lastRemoveBtn.style.display = 'none';
        }
    }

    // --- API Service Functions (Simplified for now) ---
    const apiService = {
        async createPlanWithComidas(planData) {
            // This matches the backend modification planned in Phase 2
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(planData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Error HTTP: ${response.status}` }));
                throw new Error(errorData.error || 'Failed to create plan');
            }
            return response.json();
        },
        async getPlans() {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Error HTTP: ${response.status}` }));
                throw new Error(errorData.error || 'Failed to fetch plans');
            }
            return response.json();
        },
        async deletePlan(planId) {
             const response = await fetch(`${API_BASE_URL}/${planId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Error HTTP: ${response.status}` }));
                throw new Error(errorData.error || errorData.message || 'Failed to delete plan');
            }
            return { message: 'Plan eliminado exitosamente' };
        }
    };

    // --- DOM Rendering Functions ---
    function renderPlansList(plans) {
        if (!uiElements.listaPlanes) return;
        uiElements.listaPlanes.innerHTML = '';

        if (plans.length === 0) {
            uiElements.listaPlanes.innerHTML = '<li>No hay planes de alimentación registrados.</li>';
            return;
        }

        plans.forEach(plan => {
            const li = document.createElement('li');
            let comidasHtml = '<p>No hay comidas detalladas para este plan.</p>';
            if (plan.comidas && plan.comidas.length > 0) {
                comidasHtml = '<ul class="comidas-display-list">';
                plan.comidas.forEach(comida => {
                    comidasHtml += `
                        <li>
                            <strong>${comida.tipo}</strong> (${comida.hora || 'Sin hora especificada'})<br>
                            ${comida.descripcion}
                        </li>`;
                });
                comidasHtml += '</ul>';
            }

            // Basic structure, can be enhanced with more controls (delete, toggle) later
            li.innerHTML = `
                <div class="plan-controls">
                     <button class="delete-plan-btn button-secondary" data-plan-id="${plan.id}">Eliminar</button>
                </div>
                <strong class="plan-nombre">${plan.nombre}</strong> (Usuario ID: ${plan.usuarioId || 'N/A'})<br>
                <em>${new Date(plan.fechaInicio).toLocaleDateString()} - ${new Date(plan.fechaFin).toLocaleDateString()}</em><br>
                <p>${plan.descripcion || 'Sin descripción.'}</p>
                <h4>Comidas:</h4>
                ${comidasHtml}
            `;
            uiElements.listaPlanes.appendChild(li);
        });
    }

    // --- Event Handler Functions ---
    async function loadAndRenderPlans() {
        if (uiElements.listaPlanesLoading) uiElements.listaPlanesLoading.style.display = 'block';
        if (uiElements.listaPlanesMessage) uiElements.listaPlanesMessage.style.display = 'none';
        try {
            const plans = await apiService.getPlans();
            renderPlansList(plans);
        } catch (error) {
            console.error('Error al cargar los planes:', error);
            showUIMessage(uiElements.listaPlanesMessage, `Error al cargar planes: ${error.message}`, 'error');
        } finally {
            if (uiElements.listaPlanesLoading) uiElements.listaPlanesLoading.style.display = 'none';
        }
    }

    async function handlePlanFormSubmit(event) {
        event.preventDefault();
        const planPayload = {
            nombre: uiElements.nombrePlanInput.value.trim(),
            descripcion: uiElements.descripcionPlanInput.value.trim(), // Matched ID from HTML
            fechaInicio: uiElements.fechaInicioInput.value,
            fechaFin: uiElements.fechaFinInput.value,
            usuarioId: parseInt(uiElements.usuarioIdInput.value, 10),
            comidas: []
        };

        // Basic validation
        if (!planPayload.nombre || !planPayload.fechaInicio || !planPayload.fechaFin || !planPayload.usuarioId) {
            showUIMessage(uiElements.formPlanMessage, 'Nombre, fechas y ID de Usuario son requeridos.', 'error');
            return;
        }
        if (new Date(planPayload.fechaFin) <= new Date(planPayload.fechaInicio)) {
            showUIMessage(uiElements.formPlanMessage, 'La fecha de fin debe ser posterior a la fecha de inicio.', 'error');
            return;
        }

        const comidaFieldsets = uiElements.comidasContainer.querySelectorAll('.comida');
        if (comidaFieldsets.length === 0) {
            showUIMessage(uiElements.formPlanMessage, 'Debe agregar al menos una comida.', 'error');
            return;
        }

        comidaFieldsets.forEach(fieldset => {
            const tipo = fieldset.querySelector('.tipoComida').value;
            const hora = fieldset.querySelector('.horaComida').value || null; // Allow empty time
            const descripcionComida = fieldset.querySelector('.descripcionComida').value.trim();

            if (!descripcionComida) {
                // Could accumulate errors or stop on first one
                showUIMessage(uiElements.formPlanMessage, `La descripción es requerida para todas las comidas.`, 'error');
                throw new Error("Descripción de comida faltante."); // Stop processing
            }
            planPayload.comidas.push({ tipo, hora, descripcion: descripcionComida }); // Ensure 'descripcion' matches backend if it was 'descripcionComida'
        });

        // If an error was thrown above due to meal description, this won't run.
        // Consider a more robust validation loop that collects all errors.

        try {
            const newPlan = await apiService.createPlanWithComidas(planPayload);
            showUIMessage(uiElements.formPlanMessage, `Plan "${newPlan.nombre}" creado exitosamente!`, 'success');
            uiElements.formPlan.reset();
            // Reset comidas container to initial state (one empty meal form)
            uiElements.comidasContainer.innerHTML = ''; // Clear all
            comidaIndex = 0; // Reset global counter
            addComidaField(); // Add the first one back
            const firstRemoveBtn = uiElements.comidasContainer.children[0].querySelector('.remove-comida-btn');
            if (firstRemoveBtn) firstRemoveBtn.style.display = 'none'; // Hide its remove button

            loadAndRenderPlans();
        } catch (error) {
            console.error('Error al crear el plan:', error);
            showUIMessage(uiElements.formPlanMessage, `Error al crear el plan: ${error.message}`, 'error');
        }
    }

    async function handleDeletePlanAction(planId) {
        if (!window.confirm(`¿Está seguro de que desea eliminar el plan con ID ${planId}?`)) {
            return;
        }
        try {
            const result = await apiService.deletePlan(planId);
            showUIMessage(uiElements.listaPlanesMessage, result.message || 'Plan eliminado exitosamente', 'success');
            loadAndRenderPlans();
        } catch (error) {
            console.error('Error al eliminar el plan:', error);
            showUIMessage(uiElements.listaPlanesMessage, `Error al eliminar el plan: ${error.message}`, 'error');
        }
    }


    // --- Setup Event Listeners ---
    function initializeEventListeners() {
        if (uiElements.formPlan) {
            uiElements.formPlan.addEventListener('submit', handlePlanFormSubmit);
        }
        if (uiElements.addComidaBtn) {
            uiElements.addComidaBtn.addEventListener('click', addComidaField);
        }
        if (uiElements.comidasContainer) {
            uiElements.comidasContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('remove-comida-btn')) {
                    const indexToRemove = event.target.dataset.comidaIndex;
                    if (indexToRemove !== undefined) {
                        removeComidaField(indexToRemove);
                    }
                }
            });
        }
        if (uiElements.listaPlanes) {
            uiElements.listaPlanes.addEventListener('click', (event) => {
                if (event.target.classList.contains('delete-plan-btn')) {
                    const planId = event.target.dataset.planId;
                    if (planId) {
                        handleDeletePlanAction(parseInt(planId, 10));
                    }
                }
                // Add toggle comidas logic here if needed, similar to previous version
            });
        }
    }

    // --- Initial Application Load ---
    initializeEventListeners();
    loadAndRenderPlans();
});
