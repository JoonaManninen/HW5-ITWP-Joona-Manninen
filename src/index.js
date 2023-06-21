// Create a Leaflet map and set its initial view
const map = L.map("map", {
  minZoom: -3
}).fitWorld();

// Add the tile layer with OpenStreetMap background to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// Fetch GeoJSON data and add it to the map
fetch(
  "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
)
  .then((response) => response.json())
  .then((data) => {
    // Create a Leaflet GeoJSON layer and add it to the map
    const geoJsonLayer = L.geoJSON(data, {
      weight: 2
    }).addTo(map);

    // Fit the map bounds to the GeoJSON layer
    map.fitBounds(geoJsonLayer.getBounds());

    // Add tooltip to display municipality name on hover
    geoJsonLayer.eachLayer((layer) => {
      layer.bindTooltip(layer.feature.properties.nimi, {
        sticky: true
      });
    });

    // Popup to display migration data.
    geoJsonLayer.on("click", (e) => {
      const properties = e.layer.feature.properties;
      const municipalityName = properties.nimi;
      const municipalityCode = "KU" + properties.kunta;
      // Fetching positive migration data
      fetch(
        "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f"
      )
        .then((response) => response.json())
        .then((data) => {
          const positiceCode =
            data.dataset.dimension.Tuloalue.category.index[municipalityCode];
          const positiveMigration = data.dataset.value[positiceCode];
          const positiveMigrationPopupContent =
            "Positive Migration: " + positiveMigration;

          // Fetching negative migration data
          fetch(
            "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e"
          )
            .then((response) => response.json())
            .then((data) => {
              const negativeCode =
                data.dataset.dimension.Lähtöalue.category.index[
                  municipalityCode
                ];
              const negativeMigration = data.dataset.value[negativeCode];
              const negativeMigrationPopupContent =
                "Negative Migration: " + negativeMigration;
              // Making a Leaflet popup and binding it to the clicked layer
              const popupContent =
                municipalityName +
                "<br>" +
                positiveMigrationPopupContent +
                "<br>" +
                negativeMigrationPopupContent;
              e.layer.bindPopup(popupContent).openPopup();
            });
        });
    });
  });
