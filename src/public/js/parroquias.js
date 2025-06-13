// Script para cargar parroquias dinámicamente según el municipio seleccionado

document.addEventListener('DOMContentLoaded', function() {
    var townSelect = document.getElementById('town_id');
    var parroquiaSelect = document.getElementById('parroquia_id');
    if (!townSelect || !parroquiaSelect) return;

    townSelect.addEventListener('change', function() {
        var townId = this.value;
        parroquiaSelect.innerHTML = '<option value="">Cargando...</option>';
        if (townId) {
            fetch('/api/parroquias?town_id=' + townId)
                .then(res => res.json())
                .then(function(data) {
                    parroquiaSelect.innerHTML = '<option value="">Seleccione una parroquia</option>';
                    data.forEach(function(parroquia) {
                        parroquiaSelect.innerHTML += `<option value="${parroquia.id}">${parroquia.name}</option>`;
                    });
                });
        } else {
            parroquiaSelect.innerHTML = '<option value="">Seleccione una parroquia</option>';
        }
    });
});
