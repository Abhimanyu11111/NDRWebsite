// ===============================
// USE EXISTING QGIS2WEB MAP
// ===============================

// collect layers already created by qgis2web
let layersList = [
    {name: "STATE_BOUNDARY", layer: layer_STATE_BOUNDARY_1},
    {name: "SEDIMENTARY_BASIN", layer: layer_SEDIMENTARY_BASIN_2},
    {name: "DEGREE_1X1", layer: layer_DEGREE_1X1_3},
    {name: "OALP_BLOCK", layer: layer_OALP_BLOCK_4},
    {name: "DSF_BLOCKS", layer: layer_DSF_BLOCKS_5},
    {name: "CBM_BLOCK", layer: layer_CBM_BLOCK_6},
    {name: "PRODUCING_FIELD", layer: layer_PRODUCING_FIELD_7},
    {name: "NELP_BLOCK", layer: layer_NELP_BLOCK_8},
    {name: "NOMINATION_BLOCK", layer: layer_NOMINATION_BLOCK_9}
];


// ===============================
// BUILD LAYER PANEL
// ===============================
function buildLayerUI() {

    let container = document.getElementById("layerList");
    container.innerHTML = "";

    layersList.forEach((item, i) => {

        let div = document.createElement("div");
        div.className = "layer-item";

        div.innerHTML = `
            <b>${item.name}</b><br>

            <input type="checkbox" checked
                onchange="toggleLayer(${i})"> Show<br>

            Opacity:
            <input type="range" min="0" max="1" step="0.1"
                value="1"
                onchange="setOpacity(${i}, this.value)">
        `;

        container.appendChild(div);
    });
}


// ===============================
// TOGGLE
// ===============================
function toggleLayer(i) {

    let l = layersList[i].layer;

    if (map.hasLayer(l)) {
        map.removeLayer(l);
    } else {
        map.addLayer(l);
    }
}


// ===============================
// OPACITY
// ===============================
function setOpacity(i, val) {

    let layer = layersList[i].layer;

    layer.eachLayer(function (f) {

        if (f.setStyle) {
            f.setStyle({
                opacity: val,
                fillOpacity: val
            });
        }
    });
}


// ===============================
// CLICK → TABLE PANEL
// ===============================
layersList.forEach(item => {

    item.layer.eachLayer(f => {

        f.on("click", function (e) {

            showAttributeTable(f.feature.properties);

        });

    });

});


// ===============================
// ATTRIBUTE TABLE
// ===============================
function showAttributeTable(props) {

    let html = "<table class='attr-table'>";

    for (let key in props) {
        html += `
            <tr>
                <th>${key}</th>
                <td>${props[key]}</td>
            </tr>
        `;
    }

    html += "</table>";

    document.getElementById("infoContent").innerHTML = html;
}


// ===============================
// HOVER TOOLTIP
// ===============================
layersList.forEach(item => {

    item.layer.eachLayer(f => {

        f.on("mouseover", function (e) {

            let tooltip = document.getElementById("tooltip");

            tooltip.style.display = "block";
            tooltip.innerHTML = "Feature";

            tooltip.style.left = e.originalEvent.pageX + "px";
            tooltip.style.top = e.originalEvent.pageY + "px";
        });

        f.on("mouseout", function () {
            document.getElementById("tooltip").style.display = "none";
        });

    });

});


// ===============================
// INIT AFTER MAP LOAD
// ===============================
setTimeout(() => {
    buildLayerUI();
}, 1000);