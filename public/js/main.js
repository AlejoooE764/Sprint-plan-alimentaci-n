/**
 * NutriFit Frontend Main Script
 * Handles API interactions, DOM manipulation, and event listening for plan management.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selections (Centralized) ---
    const uiElements = {
        plansListDiv: document.getElementById('plans-list'),
        createPlanForm: document.getElementById('create-plan-form'),
        createMessageDiv: document.getElementById('create-message'),
        deleteMessageDiv: document.getElementById('delete-message'),
        createPlanModal: document.getElementById('create-plan-modal'),
        openModalButton: document.getElementById('open-create-plan-modal-button'),
        closeModalButton: document.getElementById('close-create-plan-modal-button'),
        loadingIndicator: document.getElementById('loading-indicator')
    };

    const API_BASE_URL = '/api/planes';

    // --- Utility Functions ---

    /**
     * Displays a message in a specified element for a limited time.
     * @param {HTMLElement} element - The HTML element where the message will be displayed.
     * @param {string} message - The message text.
     * @param {'success' | 'error'} type - The type of message, influencing styling.
     */
    function showUIMessage(element, message, type = 'success') {
        if (!element) {
            console.warn('Message element not found for:', message);
            return;
        }
        element.textContent = message;
        element.className = `message ${type}`; // Base class + type-specific class
        element.style.display = 'block';
        setTimeout(() => {
            if (element) {
                element.textContent = '';
                element.style.display = 'none';
            }
        }, 4000); // Message visible for 4 seconds
    }

    // --- Modal Control Functions ---

    /**
     * Opens the specified modal dialog.
     * @param {HTMLElement} modalElement - The modal element to display.
     */
    function openModal(modalElement) {
        if (modalElement) modalElement.style.display = 'block';
    }

    /**
     * Closes the specified modal dialog.
     * @param {HTMLElement} modalElement - The modal element to hide.
     */
    function closeModal(modalElement) {
        if (modalElement) modalElement.style.display = 'none';
    }

    // --- API Service Functions ---
    const apiService = {
        /**
         * Fetches all alimentation plans from the server.
         * @returns {Promise<Array<Object>>} A promise that resolves to an array of plans.
         * @throws {Error} If the network response is not ok.
         */
        async getPlans() {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Error HTTP: ${response.status}` }));
                throw new Error(errorData.error || 'Failed to fetch plans');
            }
            return response.json();
        },

        /**
         * Creates a new alimentation plan.
         * @param {Object} planData - The data for the new plan.
         * @returns {Promise<Object>} A promise that resolves to the created plan object.
         * @throws {Error} If the network response is not ok.
         */
        async createPlan(planData) {
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

        /**
         * Deletes an alimentation plan by its ID.
         * @param {number} planId - The ID of the plan to delete.
         * @returns {Promise<Object>} A promise that resolves to the server's response (often empty or a success message).
         * @throws {Error} If the network response is not ok.
         */
        async deletePlan(planId) {
            const response = await fetch(`${API_BASE_URL}/${planId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Error HTTP: ${response.status}` }));
                throw new Error(errorData.error || errorData.message || 'Failed to delete plan');
            }
            // For DELETE, often no content or a simple message is returned.
            // If a specific JSON message is expected: return response.json();
            return { message: 'Plan eliminado exitosamente' }; // Assuming success if no error
        }
    };

    // --- DOM Rendering Functions ---

    /**
     * Renders the list of alimentation plans in the UI.
     * @param {Array<Object>} plans - An array of plan objects.
     */
    function renderPlansList(plans) {
        if (!uiElements.plansListDiv) return;
        uiElements.plansListDiv.innerHTML = ''; // Clear previous content

        if (plans.length === 0) {
            uiElements.plansListDiv.innerHTML = '<p>No hay planes de alimentación registrados.</p>';
            return;
        }

        const ul = document.createElement('ul');
        plans.forEach(plan => {
            const li = document.createElement('li');
            const deleteButton = `<button class="delete-button" data-plan-id="${plan.id}">Eliminar</button>`;

            let comidasHtml = 'No hay comidas registradas para este plan.';
            if (plan.comidas && plan.comidas.length > 0) {
                comidasHtml = '<ul class="comidas-list">';
                plan.comidas.forEach(comida => {
                    comidasHtml += `
                        <li>
                            <strong>${comida.tipo}</strong> (${comida.hora || 'Sin hora especificada'})<br>
                            ${comida.descripcion}
                        </li>
                    `;
                });
                comidasHtml += '</ul>';
            }

            li.innerHTML = `
                ${deleteButton}
                <strong>${plan.nombre}</strong> (ID: ${plan.id})<br>
                Usuario ID: ${plan.usuarioId} (Nombre: ${plan.usuario ? plan.usuario.nombre : 'N/A'})<br>
                Descripción: ${plan.descripcion || 'N/A'}<br>
                Inicio: ${new Date(plan.fechaInicio).toLocaleDateString()} - Fin: ${new Date(plan.fechaFin).toLocaleDateString()}<br>
                <strong>Comidas:</strong>
                ${comidasHtml}
            `;
            ul.appendChild(li);
        });
        uiElements.plansListDiv.appendChild(ul);
    }

    // --- Event Handler Functions ---

    /**
     * Fetches plans and renders them, handling loading indicators and errors.
     */
    async function loadAndRenderPlans() {
        if (uiElements.loadingIndicator) uiElements.loadingIndicator.style.display = 'block';
        try {
            const plans = await apiService.getPlans();
            renderPlansList(plans);
        } catch (error) {
            console.error('Error al cargar los planes:', error);
            showUIMessage(uiElements.deleteMessageDiv, `Error al cargar planes: ${error.message}`, 'error');
        } finally {
            if (uiElements.loadingIndicator) uiElements.loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Handles the deletion of a plan, including confirmation and UI updates.
     * @param {number} planId - The ID of the plan to delete.
     */
    async function handleDeletePlanAction(planId) {
        if (!window.confirm(`¿Está seguro de que desea eliminar el plan con ID ${planId}?`)) {
            return;
        }
        try {
            const result = await apiService.deletePlan(planId);
            showUIMessage(uiElements.deleteMessageDiv, result.message || 'Plan eliminado exitosamente', 'success');
            loadAndRenderPlans(); // Refresh the list
        } catch (error) {
            console.error('Error al eliminar el plan:', error);
            showUIMessage(uiElements.deleteMessageDiv, `Error al eliminar el plan: ${error.message}`, 'error');
        }
    }

    /**
     * Handles the submission of the "create plan" form.
     * @param {Event} event - The form submission event.
     */
    async function handleCreatePlanSubmit(event) {
        event.preventDefault();
        if (!uiElements.createPlanForm || !uiElements.createMessageDiv) return;

        const formData = new FormData(uiElements.createPlanForm);
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

    // --- Event Listeners ---
    function initEventListeners() {
        if (openModalButton && createPlanModal) {
            openModalButton.addEventListener('click', () => openModal(createPlanModal));
        }

        if (closeModalButton && createPlanModal) {
            closeModalButton.addEventListener('click', () => closeModal(createPlanModal));
        }

        // Close modal if user clicks outside of it
        window.addEventListener('click', (event) => {
            if (event.target === createPlanModal) {
                closeModal(createPlanModal);
            }
        });

        if (createPlanForm) {
            createPlanForm.addEventListener('submit', handleCreatePlanSubmit);
        }

        // Event delegation for delete buttons
        if (plansListDiv) {
            plansListDiv.addEventListener('click', (event) => {
                if (event.target.classList.contains('delete-button')) {
                    const planId = event.target.dataset.planId;
                    if (planId) {
                        handleDeletePlan(parseInt(planId, 10));
                    }
                }
            });
        }
    }

    // --- Initial Load ---
    initEventListeners();
    fetchPlans();
});
