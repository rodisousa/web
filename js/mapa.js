// Initialize map
const map = L.map('map').setView([32.64188, -16.90931], 16);

// Add base layer
const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Array of GeoJSON file URLs and their corresponding layer names
const geojsonFiles  = [

    { url: '../js/Inundacao.geojson', name: "Inundação"},
    { url: '../js/Infraestruturas.geojson', name: "Infraestruturas" },
    { url: '../js/Reservatorios.geojson', name: "Reservatórios" },
    { url: '../js/RedeCondutas.geojson', name: "Rede de Condutas" },
    { url: '../js/Estacoes.geojson', name: "Estações" },
];

const geojsonLayers = {};
geojsonFiles.forEach(file => {
    geojsonLayers[file.name] = L.layerGroup();
});

// Fetch and process GeoJSON files
Promise.all(geojsonFiles.map(file => fetch(file.url).then(response => response.json())))
    .then(geojsonDataArray => {
        geojsonDataArray.forEach((geojsonData, index) => {
            const fileName = geojsonFiles[index].name;

            // Define symbology styles
            const styleOptions = {
                "UPS": { color: "#ff0000", weight: 2, fillColor: "#f10707", fillOpacity: 0.8 },
                "Inundação": { color: "#3286d6", weight: 4, fillColor: "#aaaaff", fillOpacity: 0.3 },
                "Infraestruturas": { color: "#a0623c", weight: 3, fillColor: "#d09876", fillOpacity: 0.4 },
                "Reservatórios": { color: "#3d3937", weight: 3, fillColor: "#3d3937", fillOpacity: 0.5 },
                "Rede de Condutas": { color: "#800080", weight: 3, dashArray: "5, 5" },
                "Estações": { color: "#2c6636", weight: 3 },
                "Contadores": { color: "#8a1313", weight: 1, fillColor: "#b37575", fillOpacity: 0.7 }
            };

            // Add GeoJSON features to the respective layer group
            L.geoJSON(geojsonData, {
                style: feature => styleOptions[fileName], // Style based on layer name
                pointToLayer: (feature, latlng) => {
                    return L.marker(latlng, {
                        icon: L.divIcon({
                            className: 'marker-icon',
                            html: `<div style="background: ${styleOptions[fileName].fillColor || '#000'}; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${feature.properties.Letter || '?'}</div>`
                        })
                    });
                },
                onEachFeature: (feature, layer) => {
                    // Dynamically generate popup content for each feature
                    let popupContent = '<strong>Properties:</strong><br>';
                    for (const key in feature.properties) {
                        if (feature.properties.hasOwnProperty(key)) {
                            popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                        }
                    }
                    layer.bindPopup(popupContent);  // Bind popup content to the layer
                }
            }).addTo(geojsonLayers[fileName]); // Add the feature to the appropriate layer group

            // Add the layer group to the map (making it visible by default)
            geojsonLayers[fileName].addTo(map);
        });


    })
    .catch(error => {
        console.error('Error loading GeoJSON files:', error);
    });

// Add other controls (scale, fullscreen, etc.)
L.control.scale({ imperial: false }).addTo(map);
map.addControl(new L.Control.Fullscreen());

///////////////////////////////////////////////////////////////////////////////////////////////////

// Create a marker cluster group for UPS with appropriate options
const upsClusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: true, // Allows "spiderfying" markers when zoomed in
    showCoverageOnHover: true, // Shows the area covered by the cluster
    removeOutsideVisibleBounds: true, // Removes individual points when clustered
    disableClusteringAtZoom: 18
});

// Fetch and process the UPS GeoJSON file
fetch('../js/UPS.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        // Add UPS GeoJSON features to the cluster group
        L.geoJSON(geojsonData, {
            pointToLayer: (feature, latlng) => {
                // Customize marker icon for UPS
                return L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'marker-icon',
                        html: `<div style="background: #ff4757; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${feature.properties.Letter || '?'}</div>`
                    })
                });
            },
            onEachFeature: (feature, layer) => {
                //Conteúdo do popup
                let popupContent = '<strong>Properties:</strong><br>';
                for (const key in feature.properties) {
                    if (feature.properties.hasOwnProperty(key)) {
                        popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                    }
                }
                layer.bindPopup(popupContent);  // Popups
            }
        }).addTo(upsClusterGroup);

        upsClusterGroup.addTo(map);
    })
    .catch(error => {
        console.error('Error loading UPS GeoJSON:', error);
    });

// Marcadores dos Clusters
const contadoresClusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: true, // Links para os individuais (teia)
    showCoverageOnHover: true, // Area coberta pelos clusters
    removeOutsideVisibleBounds: true // Tira os individuais 
});

fetch('../js/Contadores.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        // Add Contadores GeoJSON features to the cluster group
        L.geoJSON(geojsonData, {
            pointToLayer: (feature, latlng) => {
                // Icon feio dos marcadores
                return L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'marker-icon',
                        html: `<div style="background: #000; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${feature.properties.Letter || '?'}</div>`
                    })
                });
            },
            onEachFeature: (feature, layer) => {
                // Conteúdo do popup
                let popupContent = '<strong>Properties:</strong><br>';
                for (const key in feature.properties) {
                    if (feature.properties.hasOwnProperty(key)) {
                        popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                    }
                }
                layer.bindPopup(popupContent);  // Popup
            }
        }).addTo(contadoresClusterGroup);

        contadoresClusterGroup.addTo(map);
    })
    .catch(error => {
        console.error('Error loading Contadores GeoJSON:', error);
    });

// Buffer com 1km dist
fetch('../js/Estacoes.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        geojsonData.features.forEach(feature => {
           
            const point = turf.point([feature.geometry.coordinates[0], feature.geometry.coordinates[1]]);
            const buffer = turf.buffer(point, 1000, { units: 'meters' });  // 1km buffer

          
            L.geoJSON(buffer, {
                style: {
                    color: "#2c6636", 
                    weight: 2,
                    fillOpacity: 0.3
                }
            }).addTo(map);

            L.geoJSON(feature, {
                pointToLayer: (feature, latlng) => {
                    return L.marker(latlng, {
                        icon: L.divIcon({
                            className: 'marker-icon',
                            html: `<div style="background: #2c6636; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${feature.properties.Letter || '?'}</div>`
                        })
                    });
                },
                onEachFeature: (feature, layer) => {
                    // Dynamically generate popup content for each Estacoes feature
                    let popupContent = '<strong>Properties:</strong><br>';
                    for (const key in feature.properties) {
                        if (feature.properties.hasOwnProperty(key)) {
                            popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                        }
                    }
                    layer.bindPopup(popupContent);  // Bind popup content to the layer
                }
            }).addTo(map);
        });
    })
    .catch(error => {
        console.error('Error loading Estacoes GeoJSON:', error);
    });
// Define layers globally so that they are accessible in toggleLayer()
const layers = [
    { name: "UPS", color: "#ff4757", layer: upsClusterGroup },
    { name: "Contadores", color: "#000", layer: contadoresClusterGroup },
    { name: "Inundação", color: "#3286d6", layer: geojsonLayers["Inundação"] },
    { name: "Infraestruturas", color: "#a0623c", layer: geojsonLayers["Infraestruturas"] },
    { name: "Reservatórios", color: "#3d3937", layer: geojsonLayers["Reservatórios"] },
    { name: "Rede de Condutas", color: "#800080", layer: geojsonLayers["Rede de Condutas"] },
    { name: "Estações", color: "#2c6636", layer: geojsonLayers["Estações"] }
];

// Function to toggle layers when checkboxes are clicked
window.toggleLayer = function (checkboxId, layerName) {
    const checkbox = document.getElementById(checkboxId);
    const layerObj = layers.find(l => l.name === layerName);

    if (layerObj) {
        if (checkbox.checked) {
            map.addLayer(layerObj.layer); // Show the layer
        } else {
            map.removeLayer(layerObj.layer); // Hide the layer
        }
    } else {
        console.error(`Layer "${layerName}" not found!`);
    }
};

// Create a custom selectable legend
const selectableLegend = L.control({ position: "bottomright" });

selectableLegend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    div.style.background = "white";
    div.style.padding = "10px";
    div.style.borderRadius = "5px";
    div.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.3)";
    div.style.width = "250px";
    div.style.height = "auto";

    // Generate checkboxes for each layer
    layers.forEach(layer => {
        const id = `legend-${layer.name.replace(/\s+/g, "-").toLowerCase()}`;
        div.innerHTML += `
            <label style="display: flex; align-items: center; margin-bottom: 5px; cursor: pointer;">
                <input type="checkbox" id="${id}" checked style="margin-right: 8px;">
                <i style="background:${layer.color}; width: 18px; height: 18px; display: inline-block; margin-right: 8px; border-radius: 4px;"></i>
                ${layer.name}
            </label>
        `;
    });

    // Attach event listeners to checkboxes AFTER they are added to DOM
    setTimeout(() => {
        layers.forEach(layer => {
            const id = `legend-${layer.name.replace(/\s+/g, "-").toLowerCase()}`;
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener("change", () => toggleLayer(id, layer.name));
            }
        });
    }, 100); // Small delay to ensure elements exist

    return div;
};

// Add the legend to the map
selectableLegend.addTo(map);
