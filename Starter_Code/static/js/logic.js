// Call API
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Retrieve data and set features function
d3.json(url).then(function (data) {
    // Console log all data retrieved
    console.log(data);
    // pass data.features information to the createFeatures function.
    createFeatures(data.features);
});

// Set function to darken marker color based on depth
function chooseColor(depth) {
    if (depth >= 90) {
        return "#FC0202";
    } else if (depth < 90 && depth >= 70) {
        return "#FC7B02";
    } else if (depth < 70 && depth > 50) {
        return "#FCBB02";
    } else if (depth < 50 && depth > 30) {
        return "#FCE102";
    } else if (depth < 30 && depth > 10) {
        return "#BFFC02";
    } else {
        return "#65FC02";
    }
};

function createFeatures(earthquakeData) {
    // using the features function from above bind a popup that shows the magnitude, place, time, and depth of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h2>Place: ${feature.properties.place}</h2><hr><p>Time: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p>
      <p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    // Set function to scale marker size with magnitude value.
    function markerSize(magnitude) {
        return magnitude * 20000;
    }

    // Create GeoJson layer based off the features we extracted above.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        // Display each datapoint on the map
        pointToLayer: function (feature, latlng) {

            // Set markers to change size with magnitude and colour with depth
            let markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.6,
                color: "black",
                stroke: true,
                weight: 0.5
            }
            return L.circle(latlng, markers);
        }
    });

    createMap(earthquakes);
}

// create mapp and add 'earthquakes' to it
function createMap(earthquakes) {
    let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    let myMap = L.map("map", {
        center: [
            37.00, -96.00
        ],
        zoom: 5,
        layers: [basemap]
    });

    earthquakes.addTo(myMap);

    // set legend and legend position
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend'),
            depth_levels = [-10, 10, 30, 50, 70, 90];

        // set a for loop for the relevant intervals. See CSS file for styling changes as well.
        for (let i = 0; i < depth_levels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(depth_levels[i] + 1) + '"></i> ' +
                depth_levels[i] + (depth_levels[i + 1] ? '&ndash;' + depth_levels[i + 1] + '<br>' : '+');
              }
              return div;
          };
      
          legend.addTo(myMap);
      }