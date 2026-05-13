import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

console.log('Mapbox GL JS Loaded:', mapboxgl)

// Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiZXJkZW5lYmF0NyIsImEiOiJjbXAzNmV4aGkwbXdyMndwbzQxcHc2azZ1In0.oHDpaVBC7sj2Y_rJIF0Usg';

const map = new mapboxgl.Map({
  container: 'map', 
  style: 'mapbox://styles/mapbox/outdoors-v12', 
  center: [-71.09415, 42.36027], 
  zoom: 12, 
  minZoom: 5, 
  maxZoom: 18, 
});

function getCoords(station) {
  const point = new mapboxgl.LngLat(+station.lon, +station.lat); 
  const { x, y } = map.project(point);
  return { cx: x, cy: y }; 
}

map.on('load', async () => {

  const bikeLaneStyle = {
    'line-color': 'green',
    'line-width': 3,
    'line-opacity': 0.4,
  }

//
// BOSTON BIKE LANES
//
  map.addSource('boston_route', {
  type: 'geojson',
  data: 'Existing_Bike_Network_2022.geojson',
});
  map.addLayer({
  id: 'bike-lanes',
  type: 'line',
  source: 'boston_route',
  paint: bikeLaneStyle,
});

//
// CAMBRIDGE BIKE LANES
//
map.addSource('cambridge_route', {
  type: 'geojson',
  data: 'RECREATION_BikeFacilities.geojson',
});

  map.addLayer({
  id: 'bike-lanes-cambridge',
  type: 'line',
  source: 'cambridge_route',
  paint: bikeLaneStyle,
});

//
// BLUEBIKE STATIONS
//

  const svg = d3.select('#map').select('svg');
  let stations = [];

  try {
    const jsonData = await d3.json("https://dsc106.com/labs/lab07/data/bluebikes-stations.json");
    stations = jsonData.data.stations;
    console.log('Stations Array:', stations);

    const trips = await d3.csv("https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv");
    console.log('Loaded Trips Data:', trips);

    const departures = d3.rollup(
      trips,
      (v) => v.length,
      (d) => d.start_station_id,
    );

    const arrivals = d3.rollup(
      trips,
      (v) => v.length,
      (d) => d.end_station_id,
    );

    stations = stations.map((station) => {
      let id = station.short_name;
      station.arrivals = arrivals.get(id) ?? 0;
      station.departures = departures.get(id) ?? 0;
      station.totalTraffic = station.arrivals + station.departures;
      return station;
    });

    console.log('Updated Stations with Traffic:', stations);

  } catch (error) {
    console.error('Error loading JSON:', error); 
  }

  const radiusScale = d3
    .scaleSqrt()
    .domain([0, d3.max(stations, (d) => d.totalTraffic)])
    .range([0, 25]);

  const circles = svg
    .selectAll('circle')
    .data(stations)
    .enter()
    .append('circle')
    .attr('r', (d) => radiusScale(d.totalTraffic)) 
    .each(function (d) {
      d3.select(this)
        .append('title')
        .text(
          `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`,
        );
    });

  function updatePositions() {
  circles
    .attr('cx', (d) => getCoords(d).cx) 
    .attr('cy', (d) => getCoords(d).cy); 
}

updatePositions();

map.on('move', updatePositions); 
map.on('zoom', updatePositions); 
map.on('resize', updatePositions); 
map.on('moveend', updatePositions);
});
