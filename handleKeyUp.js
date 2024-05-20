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


function checkSliders() {
    const sliders = getCurrentSlidersData().split(',');
    const hasNonZeroSlider = sliders.some(slider => slider > 0);
    const container = document.querySelector('.container');
    if (hasNonZeroSlider) {
        let colors = ['#FF00FF', '#FF69B4', '#8A2BE2', '#00FF00', '#ADFF2F', '#00FFFF', '#7FFF00', '#FFD700', '#FF4500', '#1E90FF'];
        let colorIndex = 0;
        setInterval(() => {
            colorIndex = (colorIndex + 100) % colors.length;
            container.style.boxShadow = `150px 150px 150px ${colors[colorIndex]}`;
        }, 3000);
    } else {
        container.style.boxShadow = '0 0 100px #00FFFF';
    }
}
