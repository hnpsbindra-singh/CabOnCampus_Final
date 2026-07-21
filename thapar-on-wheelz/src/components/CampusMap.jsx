import { useEffect, useRef } from 'react'
import { LOCATIONS, prettyLocation, getLocationCoords } from '../api/locations'

// Map grid 0-100 coordinates to Patiala lat/lng centered on Thapar campus
function getLatLng(loc) {
  const coords = getLocationCoords(loc)
  // y = 0 -> 30.3600 (North), y = 100 -> 30.3520 (South)
  const lat = 30.3600 - (coords.y / 100) * 0.008
  // x = 0 -> 76.3580 (West), x = 100 -> 76.3700 (East)
  const lng = 76.3580 + (coords.x / 100) * 0.012
  return [lat, lng]
}

export default function CampusMap({ pickup, setPickup, drop, setDrop }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const polylineRef = useRef(null)

  useEffect(() => {
    // Check if Leaflet is loaded
    const L = window.L
    if (!L || !mapContainerRef.current) return

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30.3564, 76.3647], // Center of Thapar University campus
        zoom: 16,
        minZoom: 15,
        maxZoom: 18,
        zoomControl: true,
      })

      // Add OpenStreetMap tile layer (smooth light theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map)

      mapRef.current = map
    }

    const map = mapRef.current

    // Clean up previous markers if they exist to rebuild them with updated click handlers
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    // Add markers for all locations
    LOCATIONS.forEach(loc => {
      const [lat, lng] = getLatLng(loc)

      // Color scheme based on whether it is selected
      const isPickup = pickup === loc
      const isDrop = drop === loc
      const color = isPickup ? '#8c0623' : isDrop ? '#78716c' : '#ea760a' // Red for pickup, gray for dropoff, orange default
      const fillOpacity = isPickup || isDrop ? 0.85 : 0.45
      const radius = isPickup || isDrop ? 10 : 7

      const marker = L.circleMarker([lat, lng], {
        radius: radius,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: fillOpacity
      }).addTo(map)

      // Create popup content with buttons
      const popupDiv = document.createElement('div')
      popupDiv.innerHTML = `
        <div class="leaflet-popup-title">${prettyLocation(loc)}</div>
        <div class="leaflet-popup-buttons">
          <button class="leaflet-popup-btn pickup">Set as Pickup</button>
          <button class="leaflet-popup-btn drop">Set as Dropoff</button>
        </div>
      `

      // Add click handlers inside popup
      popupDiv.querySelector('.pickup').addEventListener('click', () => {
        if (loc === drop) {
          alert('Pickup and dropoff locations cannot be the same')
        } else {
          setPickup(loc)
          map.closePopup()
        }
      })

      popupDiv.querySelector('.drop').addEventListener('click', () => {
        if (loc === pickup) {
          alert('Pickup and dropoff locations cannot be the same')
        } else {
          setDrop(loc)
          map.closePopup()
        }
      })

      marker.bindPopup(popupDiv)
      markersRef.current[loc] = marker
    })

    // Draw route line if both are selected
    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    if (pickup && drop) {
      const p1 = getLatLng(pickup)
      const p2 = getLatLng(drop)
      const line = L.polyline([p1, p2], {
        color: '#8c0623',
        weight: 4,
        dashArray: '5, 10',
        opacity: 0.85
      }).addTo(map)
      polylineRef.current = line

      // Auto fit bounds to see both pins
      const bounds = L.latLngBounds([p1, p2])
      map.fitBounds(bounds, { padding: [50, 50] })
    }

  }, [pickup, drop, setPickup, setDrop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div className="campus-map-wrapper animate-scale">
      <div ref={mapContainerRef} className="campus-map" />
    </div>
  )
}
