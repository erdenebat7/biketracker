import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
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