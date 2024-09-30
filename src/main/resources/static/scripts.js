// Initialize the map
var map = L.map('map').setView([37.7749, -122.4194], 12); // Default location is San Francisco

// Set up the OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Variables to hold the markers for reported incidents
let accidentMarker, constructionMarker, trafficMarker;

// Function to add a marker for an incident
function addIncidentMarker(lat, lon, description, iconColor) {
    const icon = L.icon({
        iconUrl: `https://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    L.marker([lat, lon], { icon: icon }).addTo(map)
        .bindPopup(`<b>${description}</b>`);
}

// Function to report an accident
function reportAccident() {
    map.on('click', function (e) {
        let lat = e.latlng.lat;
        let lon = e.latlng.lng;
        addIncidentMarker(lat, lon, 'Reported Accident', 'red');
        map.off('click'); // Disable further map clicks after placing the marker
    });
}

// Function to report construction
function reportConstruction() {
    map.on('click', function (e) {
        let lat = e.latlng.lat;
        let lon = e.latlng.lng;
        addIncidentMarker(lat, lon, 'Reported Construction', 'orange');
        map.off('click');
    });
}

// Function to report traffic congestion
function reportTraffic() {
    map.on('click', function (e) {
        let lat = e.latlng.lat;
        let lon = e.latlng.lng;
        addIncidentMarker(lat, lon, 'Reported Traffic', 'yellow');
        map.off('click');
    });
}

// Function to locate the user’s current position
function locateMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            map.setView([lat, lon], 14); // Set map view to user's location

            L.marker([lat, lon]).addTo(map)
                .bindPopup("<b>You are here</b>");
        }, function () {
            alert("Unable to retrieve your location.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Function to search for a location
function searchLocation() {
    const query = document.getElementById('search-input').value;
    if (query) {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const lat = data[0].lat;
                    const lon = data[0].lon;
                    map.setView([lat, lon], 14);

                    // Add a marker to the searched location
                    L.marker([lat, lon]).addTo(map)
                        .bindPopup(`<b>${data[0].display_name}</b>`);
                } else {
                    alert("Location not found");
                }
            })
            .catch(error => console.error("Error fetching geolocation: ", error));
    }
}

// Function to plan a route between two locations
function planRoute() {
    const startLocation = document.getElementById('route-start').value;
    const endLocation = document.getElementById('route-end').value;

    if (startLocation && endLocation) {
        const geocodeStartUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startLocation)}`;
        const geocodeEndUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endLocation)}`;

        Promise.all([fetch(geocodeStartUrl), fetch(geocodeEndUrl)])
            .then(responses => Promise.all(responses.map(res => res.json())))
            .then(data => {
                if (data[0].length > 0 && data[1].length > 0) {
                    const startLat = data[0][0].lat;
                    const startLon = data[0][0].lon;
                    const endLat = data[1][0].lat;
                    const endLon = data[1][0].lon;

                    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

                    fetch(routeUrl)
                        .then(response => response.json())
                        .then(data => {
                            const route = data.routes[0];
                            const routeCoordinates = L.geoJSON(route.geometry);

                            // Clear the map before adding the route
                            map.eachLayer(function (layer) {
                                if (!!layer.toGeoJSON && !layer._url) { // Keep the base tile layer
                                    map.removeLayer(layer);
                                }
                            });

                            // Add the route to the map
                            routeCoordinates.addTo(map);
                            map.fitBounds(routeCoordinates.getBounds());
                        })
                        .catch(error => console.error("Error fetching route: ", error));
                } else {
                    alert("One or both locations not found.");
                }
            })
            .catch(error => console.error("Error fetching geolocation: ", error));
    } else {
        alert("Please provide both start and end locations.");
    }
}

// Event listeners for the buttons
document.getElementById('report-accident').addEventListener('click', reportAccident);
document.getElementById('report-construction').addEventListener('click', reportConstruction);
document.getElementById('report-traffic').addEventListener('click', reportTraffic);
document.getElementById('locate-me').addEventListener('click', locateMe);
document.getElementById('search-button').addEventListener('click', searchLocation);
document.getElementById('find-route').addEventListener('click', planRoute);
