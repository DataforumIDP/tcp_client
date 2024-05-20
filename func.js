document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveButton');
    const clearStoreButton = document.getElementById('clearStoreButton');
    const saveIpPortButton = document.getElementById('saveIpPort');
    const saveElementNameButton = document.getElementById('saveElementName');
    const toggleStyleButton = document.getElementById('toggleStyleButton');
    const buttonStateCheck = document.getElementById('buttonStateCheck');
    const addElementButtons = document.querySelectorAll('.add-element-btn');
    const checkboxes = document.querySelectorAll('.settings .setting input[type="checkbox"]');

    if (saveButton) saveButton.addEventListener('click', saveScenario);
    if (clearStoreButton) clearStoreButton.addEventListener('click', clearStore);
    if (saveIpPortButton) saveIpPortButton.addEventListener('click', saveIpPort);
    if (saveElementNameButton) saveElementNameButton.addEventListener('click', saveElementName);
    if (toggleStyleButton) toggleStyleButton.addEventListener('click', toggleStyle);
    if (buttonStateCheck) buttonStateCheck.addEventListener('change', toggleButtonStateInputs);

    addElementButtons.forEach(btn => btn.addEventListener('click', showElementModal));
    checkboxes.forEach(checkbox => checkbox.addEventListener('change', sendSliderData));

    loadElements(store.get('elementsState', []));
    loadScenarios();

    document.getElementById('appTitle').textContent = store.get('appName', 'VERA');

    if (!store.get('editMode', false)) {
        const addElementContainer = document.getElementById('addElementContainer');
        if (addElementContainer) addElementContainer.style.display = 'none';
        if (clearStoreButton) clearStoreButton.style.display = 'none';
    }

    const appNameInput = document.getElementById('appNameInput');
    if (appNameInput) appNameInput.value = store.get('appName', 'VERA');

    const ipInput = document.getElementById('ipInput');
    const portInput = document.getElementById('portInput');
    if (ipInput) ipInput.value = store.get('ip', '0.0.0.0');
    if (portInput) portInput.value = store.get('port', 3001);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    connect();
});

let keysPressed = {};
let savedScenarios = store.get('scenarios', []);
let blockDeletion = store.get('blockDeletion', true);
let editMode = store.get('editMode', false);
let currentElementType = null;

function handleKeyDown(event) {
    keysPressed[event.key] = true;
    if (keysPressed['g'] && keysPressed['h']) {
        toggleEditMode();
    } else if (keysPressed['f'] && keysPressed['g']) {
        blockDeletion = !blockDeletion;
        store.set('blockDeletion', blockDeletion);
        loadScenarios();
    } else if (keysPressed['d'] && keysPressed['f']) {
        showModal();
    }
}

function handleKeyUp(event) {
    delete keysPressed[event.key];
}

function showModal() {
    const modal = new bootstrap.Modal(document.getElementById('modalIpPort'));
    modal.show();
}

function toggleEditMode() {
    editMode = !editMode;
    const addElementContainer = document.getElementById('addElementContainer');
    const clearStoreButton = document.getElementById('clearStoreButton');
    if (editMode) {
        addElementContainer.style.display = 'block';
        clearStoreButton.style.display = 'block';
    } else {
        addElementContainer.style.display = 'none';
        clearStoreButton.style.display = 'none';
    }
    document.querySelectorAll('.slider-row .col-12').forEach(col => {
        col.classList.toggle('col-9', editMode);
        col.classList.toggle('col-12', !editMode);
    });
    store.set('editMode', editMode);
    saveElementsState();
}

function sendSliderData() {
    const data = getCurrentSlidersData();
    client.write(data);
}

function updateButtonColor(button, color) {
    button.style.backgroundColor = button.dataset.value > 0 ? color : '#55476d20';
}

function toggleButton(button) {
    const buttonOnState = button.dataset.onState || 'Включено';
    const buttonOffState = button.dataset.offState || 'Выключено';
    const newValue = button.dataset.value === '0' ? '1' : '0';
    button.dataset.value = newValue;
    button.textContent = newValue === '0' ? buttonOffState : buttonOnState;
    updateButtonColor(button, button.dataset.color || 'green');
    sendSliderData();
    checkSliders();
}

function saveScenario() {
    const data = getCurrentSlidersData();
    savedScenarios.push(data);
    store.set('scenarios', savedScenarios);
    loadScenarios();
}

function loadScenarios() {
    const container = document.getElementById('savedScenarios');
    container.innerHTML = '';
    savedScenarios.forEach((scenario, index) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'btn-group mt-2 btn-group-margin';

        const button = document.createElement('button');
        button.className = 'btn btn-primary no-wrap';
        button.textContent = `Сценарий ${index + 1}`;
        button.dataset.scenario = JSON.stringify(scenario);
        button.addEventListener('click', (e) => {
            const scenarioData = JSON.parse(e.target.dataset.scenario);
            sendScenario(scenarioData);
        });
        groupDiv.appendChild(button);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger no-wrap delete-button';
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => deleteScenario(index));

        if (blockDeletion && index < 3) {
            deleteButton.disabled = true;
            deleteButton.style.display = 'none';
            button.style.borderTopRightRadius = '0.50rem';
            button.style.borderBottomRightRadius = '0.50rem';
        } else {
            groupDiv.appendChild(deleteButton);
        }

        container.appendChild(groupDiv);
    });
}

function sendScenario(scenario) {
    const values = scenario.split(',');
    updateSlidersAndButtons(values);
    const data = getCurrentSlidersData();
    client.write(data);
}

function deleteScenario(index) {
    savedScenarios.splice(index, 1);
    store.set('scenarios', savedScenarios);
    loadScenarios();
}

function getCurrentSlidersData() {
    const elements = [];
    document.querySelectorAll('.slider-row').forEach(row => {
        const slider = row.querySelector('.slider');
        const button = row.querySelector('.btn');
        const checkbox = row.querySelector('.settings');
        if (slider && button) {
            elements.push(button.dataset.value);
        } else if (slider && checkbox) {
            elements.push(slider.value);
            elements.push(checkbox.checked ? '1' : '0');
        } else if (slider) {
            elements.push(slider.value);
        } else if (button) {
            elements.push(button.dataset.value);
        } else if (checkbox) {
            elements.push(checkbox.checked ? '1' : '0');
        }
    });
    return elements.join(',');
}

function updateSlidersAndButtons(values) {
    document.querySelectorAll('.slider-row').forEach((row, index) => {
        const slider = row.querySelector('.slider');
        const button = row.querySelector('.btn');
        const checkbox = row.querySelector('.settings');
        if (values && values[index]) {
            const value = parseInt(values[index], 10);
            if (slider && button) {
                slider.value = value;
                button.dataset.value = value;
                updateButtonColor(button, button.dataset.color || 'green');
            } else if (slider && checkbox) {
                slider.value = value;
                checkbox.checked = parseInt(values[index + 1], 10) === 1;
            } else if (slider) {
                slider.value = value;
            } else if (button) {
                button.dataset.value = value;
                updateButtonColor(button, button.dataset.color || 'green');
            } else if (checkbox) {
                checkbox.checked = value === 1;
            }
        }
    });
}

function showElementModal(event) {
    currentElementType = event.target.getAttribute('data-type');
    const modal = new bootstrap.Modal(document.getElementById('elementModal'));
    modal.show();
}

function saveElementName() {
    const elementName = document.getElementById('elementNameInput').value;
    const maxValue = document.getElementById('elementMaxValueInput').value || '10';
    const row = document.getElementById('rowInput').value || '1';
    const position = document.getElementById('positionInput').value || '1';
    const showLabel = document.getElementById('showLabelCheck').checked;
    const buttonStateCheck = document.getElementById('buttonStateCheck').checked;
    const buttonOnState = document.getElementById('buttonOnState').value || 'Включено';
    const buttonOffState = document.getElementById('buttonOffState').value || 'Выключено';
    const sendStateCheck = document.getElementById('sendStateCheck').checked;
    const elementColor = document.getElementById('elementColorInput').value || 'green';

    addElement(currentElementType, elementName, maxValue, row, position, showLabel, buttonStateCheck, buttonOnState, buttonOffState, sendStateCheck, elementColor);
    const modal = bootstrap.Modal.getInstance(document.getElementById('elementModal'));
    modal.hide();
}

function addElement(type, name, maxValue, row, position, showLabel, buttonStateCheck, buttonOnState, buttonOffState, sendStateCheck, elementColor) {
    const container = document.getElementById('sliderContainer');
    const index = container.children.length + 1;
    const newElement = createElement(type, index, name, maxValue, row, position, showLabel, buttonStateCheck, buttonOnState, buttonOffState, sendStateCheck, elementColor);
    container.appendChild(newElement);
    saveElementsState();
}

function createElement(type, index, name, maxValue, row, position, showLabel, buttonStateCheck, buttonOnState, buttonOffState, sendStateCheck, elementColor) {
    const rowElement = document.querySelector(`.row[data-row="${row}"]`) || document.createElement('div');
    rowElement.className = 'row slider-row';
    rowElement.dataset.row = row;

    const colElement = document.createElement('div');
    colElement.className = 'col-12 d-flex';
    colElement.style.order = position;

    if (showLabel) {
        const label = document.createElement('label');
        label.textContent = name || `Элемент ${index}`;
        colElement.appendChild(label);
    }

    if (type === 'slider') {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = maxValue;
        slider.value = '0';
        slider.className = 'slider';
        slider.style.backgroundColor = elementColor;
        slider.addEventListener('input', function() {
            sendSliderData();
        });
        colElement.appendChild(slider);
    } else if (type === 'button') {
        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = buttonOffState;
        button.dataset.value = '0';
        button.dataset.onState = buttonOnState;
        button.dataset.offState = buttonOffState;
        button.dataset.sendState = sendStateCheck;
        button.dataset.color = elementColor;
        button.style.backgroundColor = '#55476d20';
        button.addEventListener('click', function() {
            toggleButton(button);
            if (sendStateCheck) {
                sendSliderData();
            }
        });
        colElement.appendChild(button);
    } else if (type === 'checkbox') {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'settings ms-2';
        checkbox.addEventListener('change', function() {
            sendSliderData();
        });
        colElement.appendChild(checkbox);
    } else if (type === 'combined') {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = maxValue;
        slider.value = '0';
        slider.className = 'slider';
        slider.style.backgroundColor = elementColor;
        slider.addEventListener('input', function() {
            const value = slider.value;
            button.dataset.value = value;
            updateButtonColor(button, elementColor);
            sendSliderData();
        });

        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = buttonOffState;
        button.dataset.value = '0';
        button.dataset.onState = buttonOnState;
        button.dataset.offState = buttonOffState;
        button.dataset.sendState = sendStateCheck;
        button.dataset.color = elementColor;
        button.style.backgroundColor = '#55476d20';
        button.addEventListener('click', function() {
            const newValue = button.dataset.value === '0' ? maxValue : '0';
            slider.value = newValue;
            button.dataset.value = newValue;
            updateButtonColor(button, elementColor);
            button.textContent = newValue === '0' ? buttonOffState : buttonOnState;
            if (sendStateCheck) {
                sendSliderData();
            }
        });

        colElement.appendChild(slider);
        colElement.appendChild(button);
    } else if (type === 'combined2') {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = maxValue;
        slider.value = '0';
        slider.className = 'slider';
        slider.style.backgroundColor = elementColor;
        slider.addEventListener('input', function() {
            sendSliderData();
            saveElementsState();
        });

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'settings ms-2';
        checkbox.addEventListener('change', function() {
            sendSliderData();
            saveElementsState();
        });

        colElement.appendChild(slider);
        colElement.appendChild(checkbox);
    }

    rowElement.appendChild(colElement);
    return rowElement;
}

function loadElements(elementsState) {
    const container = document.getElementById('sliderContainer');
    container.innerHTML = '';
    elementsState.forEach((element, index) => {
        const newElement = createElement(
            element.type, 
            index + 1, 
            element.label, 
            element.maxValue || '10', 
            element.row || '1', 
            element.position || '1', 
            element.showLabel || false, 
            element.buttonStateCheck || false, 
            element.buttonOnState || 'Включено', 
            element.buttonOffState || 'Выключено', 
            element.sendStateCheck || false, 
            element.color || 'green'
        );
        const slider = newElement.querySelector('.slider');
        const button = newElement.querySelector('.btn');
        const checkbox = newElement.querySelector('.settings');

        if (slider) slider.value = element.value;
        if (button) {
            button.dataset.value = element.value;
            button.textContent = element.value === '0' ? button.dataset.offState : button.dataset.onState;
            updateButtonColor(button, button.dataset.color || 'green');
        }
        if (checkbox) checkbox.checked = element.checked;

        container.appendChild(newElement);
    });

    if (editMode) {
        enableEditMode();
    }
}

function enableEditMode() {
    const addElementContainer = document.getElementById('addElementContainer');
    const clearStoreButton = document.getElementById('clearStoreButton');
    addElementContainer.style.display = 'block';
    clearStoreButton.style.display = 'block';
}

function saveElementsState() {
    const elementsState = [];
    document.querySelectorAll('.slider-row').forEach((row, index) => {
        const label = row.querySelector('label') ? row.querySelector('label').textContent : null;
        const slider = row.querySelector('.slider');
        const button = row.querySelector('.btn:not(.delete-button)');
        const checkbox = row.querySelector('.settings');
        const rowIndex = row.dataset.row;
        const position = Array.from(row.children).indexOf(row);

        if (slider && button) {
            elementsState.push({ 
                type: 'combined', 
                label: label, 
                value: slider.value, 
                maxValue: slider.max,
                row: rowIndex,
                position: position,
                showLabel: !!label,
                buttonStateCheck: !!button.dataset.onState,
                buttonOnState: button.dataset.onState,
                buttonOffState: button.dataset.offState,
                sendStateCheck: button.dataset.sendState,
                color: button.dataset.color
            });
        } else if (slider && checkbox) {
            elementsState.push({ 
                type: 'combined2', 
                label: label, 
                value: slider.value, 
                checked: checkbox.checked, 
                maxValue: slider.max,
                row: rowIndex,
                position: position,
                showLabel: !!label,
                color: slider.style.backgroundColor
            });
        } else if (slider) {
            elementsState.push({ 
                type: 'slider', 
                label: label, 
                value: slider.value, 
                maxValue: slider.max,
                row: rowIndex,
                position: position,
                showLabel: !!label,
                color: slider.style.backgroundColor
            });
        } else if (button) {
            elementsState.push({ 
                type: 'button', 
                label: label,
                row: rowIndex,
                position: position,
                showLabel: !!label,
                buttonStateCheck: !!button.dataset.onState,
                buttonOnState: button.dataset.onState,
                buttonOffState: button.dataset.offState,
                sendStateCheck: button.dataset.sendState,
                color: button.dataset.color
            });
        } else if (checkbox) {
            elementsState.push({ 
                type: 'checkbox', 
                label: label, 
                value: checkbox.checked ? '1' : '0',
                row: rowIndex,
                position: position,
                showLabel: !!label
            });
        }
    });
    store.set('elementsState', elementsState);
}

function clearStore() {
    store.clear();
    loadElements([]);
    loadScenarios();
}

function toggleStyle() {
    const styleLink = document.getElementById('styleLink');
    if (styleLink.getAttribute('href') === 'style.css') {
        styleLink.setAttribute('href', 'style2.css');
    } else {
        styleLink.setAttribute('href', 'style.css');
    }
    store.set('currentStyle', styleLink.getAttribute('href'));
}

function saveIpPort() {
    const ip = document.getElementById('ipInput').value;
    const port = document.getElementById('portInput').value;
    const appName = document.getElementById('appNameInput').value;
    store.set('ip', ip);
    store.set('port', port);
    store.set('appName', appName);
    document.getElementById('appTitle').textContent = appName;
    document.location.reload();
}

function toggleButtonStateInputs() {
    const buttonStateInputs = document.getElementById('buttonStateInputs');
    buttonStateInputs.style.display = document.getElementById('buttonStateCheck').checked ? 'block' : 'none';
}

function checkSliders() {
    const sliders = getCurrentSlidersData().split(',');
    const hasNonZeroSlider = sliders.some(slider => slider > 0);
    const container = document.querySelector('.container');
    if (hasNonZeroSlider) {
        let colors = ['#FF00FF', '#FF69B4', '#8A2BE2', '#00FF00', '#ADFF2F', '#00FFFF', '#7FFF00', '#FFD700', '#FF4500', '#1E90FF'];
        let colorIndex = 0;
        setInterval(() => {
            colorIndex = (colorIndex + 1) % colors.length;
            container.style.boxShadow = `0 0 10px ${colors[colorIndex]}`;
        }, 3000);
    } else {
        container.style.boxShadow = '0 0 1px #00FFFF';
    }
}
