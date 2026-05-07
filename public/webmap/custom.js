(function () {
    var layer_STREETS_0 = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
            attribution: "Tiles &copy; Esri",
            minZoom: 5,
            maxZoom: 28
        }
    );

    var layer_LIGHT_0 = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
            attribution: "&copy; OpenStreetMap &copy; CARTO",
            minZoom: 5,
            maxZoom: 28
        }
    );

    var layer_TOPO_0 = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {
            attribution: "Tiles &copy; Esri",
            minZoom: 5,
            maxZoom: 28
        }
    );

    var basemapLayers = [
        { name: "Imagery", layer: layer_WORLD_IMAGERY_0 },
        { name: "Streets", layer: layer_STREETS_0 },
        { name: "Topo", layer: layer_TOPO_0 },
        { name: "Light Gray", layer: layer_LIGHT_0 }
    ];

    var activeBasemap = "Imagery";
    var dragIndex = null;
    var searchMarker = null;
    var url = {
        "Nominatim OSM": "https://nominatim.openstreetmap.org/search?format=geojson&addressdetails=1&",
        "France BAN": "https://api-adresse.data.gouv.fr/search/?"
    };

    var layersList = [
        { name: "NOMINATION_BLOCK", layer: layer_NOMINATION_BLOCK_9, opacity: 1, legend: '<img src="legend/NOMINATION_BLOCK_9.png" /> NOMINATION_BLOCK', legendOpen: false },
        { name: "NELP_BLOCK", layer: layer_NELP_BLOCK_8, opacity: 1, legend: '<img src="legend/NELP_BLOCK_8.png" /> NELP_BLOCK', legendOpen: false },
        { name: "PRODUCING_FIELD", layer: layer_PRODUCING_FIELD_7, opacity: 1, legend: '<img src="legend/PRODUCING_FIELD_7.png" /> PRODUCING_FIELD', legendOpen: false },
        { name: "CBM_BLOCK", layer: layer_CBM_BLOCK_6, opacity: 1, legend: '<img src="legend/CBM_BLOCK_6.png" /> CBM_BLOCK', legendOpen: false },
        { name: "DSF_BLOCKS", layer: layer_DSF_BLOCKS_5, opacity: 1, legend: '<img src="legend/DSF_BLOCKS_5.png" /> DSF_BLOCKS', legendOpen: false },
        { name: "OALP_BLOCK", layer: layer_OALP_BLOCK_4, opacity: 1, legend: '<img src="legend/OALP_BLOCK_4.png" /> OALP_BLOCK', legendOpen: false },
        { name: "DEGREE_1X1", layer: layer_DEGREE_1X1_3, opacity: 1, legend: '<img src="legend/DEGREE_1X1_3.png" /> DEGREE_1X1', legendOpen: false },
        { name: "SEDIMENTARY_BASIN", layer: layer_SEDIMENTARY_BASIN_2, opacity: 1, legend: 'SEDIMENTARY_BASIN<br /><table><tr><td style="text-align:center;"><img src="legend/SEDIMENTARY_BASIN_2_CATEGORYI0.png" /></td><td>CATEGORY-I</td></tr><tr><td style="text-align:center;"><img src="legend/SEDIMENTARY_BASIN_2_CATEGORYII1.png" /></td><td>CATEGORY-II</td></tr><tr><td style="text-align:center;"><img src="legend/SEDIMENTARY_BASIN_2_CATEGORYIII2.png" /></td><td>CATEGORY-III</td></tr></table>', legendOpen: false },
        { name: "STATE_BOUNDARY", layer: layer_STATE_BOUNDARY_1, opacity: 1, legend: '<img src="legend/STATE_BOUNDARY_1.png" /> STATE_BOUNDARY', legendOpen: false }
    ];

    function setLayerOpacity(index, value) {
        var item = layersList[index];
        item.opacity = parseFloat(value);

        item.layer.eachLayer(function (f) {
            if (!f.setStyle) {
                return;
            }

            var currentFillOpacity = f.options.fillOpacity;
            var styleUpdate = { opacity: item.opacity };

            if (currentFillOpacity && currentFillOpacity > 0) {
                styleUpdate.fillOpacity = item.opacity;
            } else {
                styleUpdate.fillOpacity = 0;
            }

            f.setStyle(styleUpdate);
        });
    }

    function applyLayerOrder() {
        var startZ = 401;
        var total = layersList.length;

        layersList.forEach(function (item, index) {
            var pane = item.layer.getPane ? item.layer.getPane() : null;
            if (pane) {
                pane.style.zIndex = startZ + (total - index);
            }
            if (map.hasLayer(item.layer) && item.layer.bringToFront) {
                item.layer.bringToFront();
            }
        });
    }

    function toggleLayer(index, checked) {
        var item = layersList[index];
        if (checked) {
            map.addLayer(item.layer);
        } else {
            map.removeLayer(item.layer);
        }
        applyLayerOrder();
        buildLayerPanel();
    }

    function zoomToLayer(index) {
        var item = layersList[index];
        if (item.layer && item.layer.getBounds && item.layer.getBounds().isValid()) {
            map.fitBounds(item.layer.getBounds(), { padding: [20, 20] });
        }
    }

    function toggleLayerLegend(index) {
        layersList[index].legendOpen = !layersList[index].legendOpen;
        buildLayerPanel();
    }

    function setBasemap(name) {
        basemapLayers.forEach(function (item) {
            if (map.hasLayer(item.layer)) {
                map.removeLayer(item.layer);
            }
        });

        var selected = basemapLayers.find(function (item) {
            return item.name === name;
        });

        if (selected) {
            map.addLayer(selected.layer);
            activeBasemap = name;
        }
        buildBasemapPanel();
    }

    function buildBasemapPanel() {
        var container = document.getElementById("basemapPanelBody");
        container.innerHTML = "";

        basemapLayers.forEach(function (item) {
            var div = document.createElement("div");
            div.className = "basemap-item" + (activeBasemap === item.name ? " active" : "");
            div.textContent = item.name;
            div.addEventListener("click", function () {
                setBasemap(item.name);
            });
            container.appendChild(div);
        });
    }

    function moveLayer(fromIndex, toIndex) {
        if (toIndex < 0 || toIndex >= layersList.length || fromIndex === toIndex) {
            return;
        }

        var moved = layersList.splice(fromIndex, 1)[0];
        layersList.splice(toIndex, 0, moved);

        applyLayerOrder();
        buildLayerPanel();
        buildOpacityPanel();
        buildLegendPanel();
    }

    function buildLayerPanel() {
        var container = document.getElementById("layerList");
        container.innerHTML = "";

        layersList.forEach(function (item, index) {
            var div = document.createElement("div");
            div.className = "layer-item" + (item.legendOpen ? " active-layer" : "");
            div.draggable = true;

            div.innerHTML =
                '<div class="layer-row">' +
                    '<div class="layer-name">' +
                        '<span class="drag-handle">&#9776;</span>' +
                        '<label>' +
                            '<input type="checkbox" ' + (map.hasLayer(item.layer) ? "checked" : "") + ">" +
                            '<span class="layer-text">' + escapeHtml(item.name) + "</span>" +
                        "</label>" +
                    "</div>" +
                    '<div class="layer-tools">' +
                        '<button type="button" class="zoom-layer" title="Zoom to layer">Z</button>' +
                        '<button type="button" class="toggle-legend" title="Layer legend">L</button>' +
                    "</div>" +
                    '<div class="layer-actions">' +
                        '<button type="button" class="move-up">&#9650;</button>' +
                        '<button type="button" class="move-down">&#9660;</button>' +
                    "</div>" +
                "</div>" +
                '<div class="layer-legend-inline' + (item.legendOpen ? " open" : "") + '">' + item.legend + "</div>";

            div.querySelector("input").addEventListener("change", function (e) {
                toggleLayer(index, e.target.checked);
            });
            div.querySelector(".move-up").addEventListener("click", function () {
                moveLayer(index, index - 1);
            });
            div.querySelector(".move-down").addEventListener("click", function () {
                moveLayer(index, index + 1);
            });
            div.querySelector(".zoom-layer").addEventListener("click", function () {
                zoomToLayer(index);
            });
            div.querySelector(".toggle-legend").addEventListener("click", function () {
                toggleLayerLegend(index);
            });
            div.addEventListener("dragstart", function () {
                dragIndex = index;
            });
            div.addEventListener("dragover", function (e) {
                e.preventDefault();
                div.classList.add("drag-over");
            });
            div.addEventListener("dragleave", function () {
                div.classList.remove("drag-over");
            });
            div.addEventListener("drop", function (e) {
                e.preventDefault();
                div.classList.remove("drag-over");
                moveLayer(dragIndex, index);
            });

            container.appendChild(div);
        });
    }

    function buildOpacityPanel() {
        var container = document.getElementById("opacityPanelBody");
        container.innerHTML = "";

        layersList.forEach(function (item, index) {
            var div = document.createElement("div");
            div.className = "opacity-item";

            div.innerHTML =
                "<div>" + escapeHtml(item.name) + "</div>" +
                '<div class="opacity-row">' +
                    '<input type="range" min="0" max="100" step="10" value="' + Math.round(item.opacity * 100) + '">' +
                    '<span class="opacity-value">' + Math.round(item.opacity * 100) + '%</span>' +
                "</div>";

            var slider = div.querySelector("input");
            var valueLabel = div.querySelector(".opacity-value");

            slider.addEventListener("input", function () {
                var decimalValue = parseInt(slider.value, 10) / 100;
                valueLabel.textContent = slider.value + "%";
                setLayerOpacity(index, decimalValue);
            });

            container.appendChild(div);
        });
    }

    function buildLegendPanel() {
        var container = document.getElementById("legendList");
        container.innerHTML = "";

        layersList.forEach(function (item) {
            var div = document.createElement("div");
            div.className = "legend-item";
            div.innerHTML = item.legend;
            container.appendChild(div);
        });
    }

    var photonControl = L.control.photon({
        url: url["Nominatim OSM"],
        feedbackLabel: "",
        position: "topleft",
        includePosition: true,
        initial: true
    }).addTo(map);

    photonControl._container.childNodes[0].style.borderRadius = "8px";

    photonControl.on("selected", function (e) {
        if (searchMarker) {
            map.removeLayer(searchMarker);
            searchMarker = null;
        }

        var choice = e.choice;
        var coords = choice.geometry && choice.geometry.coordinates ? choice.geometry.coordinates : null;
        if (!coords) {
            return;
        }

        var latlng = L.latLng(coords[1], coords[0]);
        var label = typeof choice.properties.label === "undefined"
            ? choice.properties.display_name
            : choice.properties.label;

        searchMarker = L.marker(latlng).addTo(map);
        searchMarker.bindPopup(escapeHtml(label), {
            autoPan: false
        }).openPopup();

        e.target.input.value = label;
    });

    var search = document.getElementsByClassName("leaflet-photon leaflet-control")[0];
    search.classList.add("leaflet-control-search");
    search.style.display = "flex";
    search.style.backgroundColor = "rgba(255,255,255,0.92)";

    var button = document.createElement("div");
    button.id = "gcd-button-control";
    button.className = "gcd-gl-btn fa fa-search search-button";
    search.insertBefore(button, search.firstChild);

    var searchInputWrap = search.lastChild;
    searchInputWrap.style.display = "none";
    button.addEventListener("click", function () {
        searchInputWrap.style.display = searchInputWrap.style.display === "none" ? "block" : "none";
    });

    applyLayerOrder();
    buildBasemapPanel();
    buildLayerPanel();
    buildOpacityPanel();
    buildLegendPanel();
})();
