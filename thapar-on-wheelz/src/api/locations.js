export const LOCATIONS = [
  "AGIRA_HALL","AMBARAM_HALL","AMRITAM_HALL","ANANTA_HALL","ANANTAM_HALL",
  "AUDITORIUM","C_BLOCK","C_HALL","COS_COMPLEX","CSED",
  "DHRITI_HALL","DIRECTORATE","E_BLOCK","ELC","F_BLOCK",
  "G_BLOCK","G_BLOCK_CANTEEN","H_BLOCK","HEALTH_CENTRE",
  "HOSTEL_FRF","HOSTEL_FRG","IRA_HALL","KRAVINGS","LIBRARY","LT_AND_LP",
  "MAIN_GATE","MECHANICAL_DEPARTMENT","NEERAM_HALL","OAT",
  "PRITHVI_HALL","SBI_BANK","STREET","TAN_BUILDING","TEJAS_HALL","TSLAS",
  "VAHNI_HALL","VASUDHA_HALL_E","VASUDHA_HALL_G","VENTURE_LAB",
  "VIYAT_HALL","VYAN_HALL","VYOM_HALL"
]

// 2D grid coordinates scale 0-100 mapping to campus layout
const COORDINATES = {
  "MAIN_GATE": { x: 50, y: 5 },
  "LIBRARY": { x: 50, y: 50 },
  "CSED": { x: 55, y: 65 },
  "COS_COMPLEX": { x: 40, y: 45 },
  "AUDITORIUM": { x: 48, y: 25 },
  "HEALTH_CENTRE": { x: 68, y: 40 },
  "SBI_BANK": { x: 52, y: 35 },
  "C_BLOCK": { x: 50, y: 38 },
  "OAT": { x: 58, y: 52 },
  "VENTURE_LAB": { x: 42, y: 60 },
  "HOSTEL_FRF": { x: 80, y: 80 },
  "HOSTEL_FRG": { x: 82, y: 78 },
  "AGIRA_HALL": { x: 75, y: 72 },
  "AMBARAM_HALL": { x: 78, y: 75 },
  "LT_AND_LP": { x: 55, y: 48 },
  "E_BLOCK": { x: 46, y: 42 },
  "F_BLOCK": { x: 48, y: 45 },
  "G_BLOCK": { x: 52, y: 48 }
}

export function prettyLocation(loc) {
  return loc.replace(/_/g, ' ')
}

export function getLocationCoords(loc) {
  if (COORDINATES[loc]) return COORDINATES[loc]
  // Deterministic calculation for coordinates of other locations
  const idx = LOCATIONS.indexOf(loc)
  return {
    x: 20 + ((idx * 17) % 60),
    y: 20 + ((idx * 23) % 60)
  }
}

/**
 * Calculates simulated distance and travel duration between locations.
 * Campus is modeled roughly as 1.5 km x 1.5 km.
 * E-rickshaw average travel speed is ~12 km/h (0.2 km/min).
 */
export function calculateRouteDetails(pickup, drop) {
  if (!pickup || !drop || pickup === drop) {
    return { distanceKm: 0, durationMins: 0 }
  }

  const p1 = getLocationCoords(pickup)
  const p2 = getLocationCoords(drop)

  const dx = p1.x - p2.x
  const dy = p1.y - p2.y

  // Scale grid coordinates to real kilometers
  const scale = 1.5 / 100 
  const distanceKm = Math.sqrt(dx * dx + dy * dy) * scale

  // Travel speed is 0.2 km/min
  const speedKmPerMin = 12 / 60 
  let durationMins = Math.round(distanceKm / speedKmPerMin + 1.5) // Add 1.5 min pick-up buffer

  // Clamp values to realistic limits
  durationMins = Math.max(3, Math.min(15, durationMins))

  return {
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    durationMins
  }
}
