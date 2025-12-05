<script lang="ts">
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import type { Map, Marker } from 'leaflet';
  import type { Institution } from '$lib/game/institutions';
  import { DotEmitter } from '$lib/effects/DotEmitter';

  export let institutions: Institution[] = [];
  export let isMissionActive: boolean = false;

  const dispatch = createEventDispatcher();

  let mapElement: HTMLElement;
  let map: Map;
  let markers: { [id: number]: Marker } = {};
  
  // To keep track of running animations
  const activeEmitters = new Set<number>();

  let L: any;

  onMount(async () => {
    if (typeof window !== 'undefined') {
      L = await import('leaflet');
      map = L.map(mapElement, {
          preferCanvas: true,
          zoomControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          boxZoom: false,
          keyboard: false,
          dragging: false,
          minZoom: 6, // Allow slightly lower for responsive layouts if needed, but keep max restrictive
          maxZoom: 7
      }).setView([46.6, 2.2137], 6.5); // slightly adjusted center and zoom

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Create a custom pane for dots to sit below the mask
      map.createPane('dotsPane');
      map.getPane('dotsPane').style.zIndex = 350;

      // --- France Mask ---
      try {
          const response = await fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/metropole-version-simplifiee.geojson');
          const data = await response.json();
          
          // Create a giant rectangle covering the world
          const world = [
              [90, -180],
              [90, 180],
              [-90, 180],
              [-90, -180]
          ];

          // Extract France coordinates from MultiPolygon
          // Structure: Feature -> geometry -> coordinates -> Array of Polygons -> Array of Rings -> Array of Points
          const francePolygons = data.geometry.coordinates;
          const franceHoles = francePolygons.map((polygon: any) => 
              polygon[0].map((point: any) => [point[1], point[0]]) // Swap lon/lat to lat/lon
          );

          // Create the mask polygon: World is the outer shell, France parts are the holes
          const maskWithHoles = [world, ...franceHoles];

          L.polygon(maskWithHoles, {
              color: 'transparent', // No border
              fillColor: '#f0f0f0', // Match page background
              fillOpacity: 1,
              interactive: false // Let clicks pass through
          }).addTo(map);

      } catch (e) {
          console.error("Failed to load France mask:", e);
      }

      // Handle popup button clicks
      map.on('popupopen', (e: any) => {
          const button = e.popup._contentNode.querySelector('.start-mission-btn');
          if (button) {
              button.addEventListener('click', () => {
                  const id = parseInt(button.getAttribute('data-id'));
                  dispatch('start_mission', id);
                  map.closePopup();
              });
          }
      });

      drawElements();
    }
  });

  afterUpdate(() => {
    if (map) {
      drawElements();
    }
  });
  
  function drawElements() {
      institutions.forEach(institution => {
        const existingMarker = markers[institution.id];
        const icon = getIcon(institution);

        let popupContent = `
            <div class="map-popup">
                <h3>${institution.name}</h3>
                <p>Dependency: <strong>${institution.dependency.toFixed(1)}%</strong></p>
        `;

        if (!institution.liberated) {
            const disabledAttr = isMissionActive ? 'disabled' : '';
            popupContent += `<button class="start-mission-btn" data-id="${institution.id}" ${disabledAttr}>Start Mission</button>`;
        } else {
            popupContent += `<p class="liberated-text">Liberated!</p>`;
        }
        popupContent += `</div>`;

        if (existingMarker) {
            existingMarker.setIcon(icon);
            // Only update popup content if it's not currently open to avoid flickering/closing
            if (!existingMarker.isPopupOpen()) {
                existingMarker.bindPopup(popupContent);
            }
        } else {
            const marker = L.marker([institution.lat, institution.lng], { icon }).addTo(map);
            marker.bindPopup(popupContent);
            // We don't need the click event to dispatch 'institution_selected' anymore if the interaction is in the popup
            // but keeping it for centering or other effects might be useful.
            // marker.on('click', () => { dispatch('institution_selected', institution); }); 
            markers[institution.id] = marker;
        }
        
        // --- Spreading Dots Animation ---
        if (institution.liberated && !activeEmitters.has(institution.id)) {
            const emitter = new DotEmitter(L, map, L.latLng(institution.lat, institution.lng), 2000000, 'dotsPane');
            emitter.start();
            activeEmitters.add(institution.id);
        }
      });
  }

  function getIcon(institution: Institution) {
    let color: string;
    if (institution.liberated) {
        color = '#007bff'; // Blue
    } else if (institution.dependency > 70) {
        color = '#dc3545'; // Red
    } else if (institution.dependency > 40) {
        color = '#fd7e14'; // Orange
    } else {
        color = '#ffc107'; // Yellow
    }

    return L.divIcon({
      className: `custom-div-icon`,
      html: `<div style="background-color:${color};" class="marker-pin"></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });
  }
</script>

<div class="map-container" bind:this={mapElement}></div>

<style>
  .map-container {
    height: 100vh;
    width: 100%;
  }

  :global(.custom-div-icon .marker-pin) {
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      position: absolute;
      transform: rotate(-45deg);
      left: 50%;
      top: 50%;
      margin: -15px 0 0 -15px;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
  }

  /* Leaflet Popup Theming */
  :global(.leaflet-popup-content-wrapper), :global(.leaflet-popup-tip) {
      background-color: #5d4037;
      color: #ffe0b2;
      border: 2px solid #3e2723;
      border-radius: 4px;
  }
  
  :global(.leaflet-popup-content) {
      margin: 13px 19px;
      line-height: 1.4;
  }

  :global(.map-popup h3) {
      margin: 0 0 0.5rem 0;
      color: #ffcc80;
      border-bottom: 1px solid #8d6e63;
      padding-bottom: 0.25rem;
  }

  :global(.start-mission-btn) {
        width: 100%;
        padding: 0.5rem;
        border: 2px solid #3e2723;
        background-color: #a1887f;
        color: #2d1915;
        cursor: pointer;
        border-radius: 4px;
        font-family: inherit;
        font-weight: bold;
        text-transform: uppercase;
        box-shadow: 0 3px 0 #3e2723;
        margin-top: 0.5rem;
  }
  :global(.start-mission-btn:hover:not(:disabled)) {
      background-color: #bcaaa4;
      box-shadow: 0 4px 0 #3e2723;
  }
  :global(.start-mission-btn:active:not(:disabled)) {
      box-shadow: 0 1px 0 #3e2723;
      transform: translateY(2px);
  }
  :global(.start-mission-btn:disabled) {
      background-color: #6d4c41;
      color: #4e342e;
      border-color: #3e2723;
      box-shadow: none;
      cursor: not-allowed;
  }

  :global(.liberated-text) {
      color: #66bb6a;
      font-weight: bold;
      text-align: center;
  }
</style>
