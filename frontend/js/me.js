const SHANGHAI_CENTER = { lat: 31.2304, lng: 121.4737 };
const mapState = {
  food: { map: null, markers: [], bounds: null },
  sight: { map: null, markers: [], bounds: null },
};

function renderCard(container, item) {
  const card = document.createElement("div");
  card.className = "card";
  const safeTitle = escapeHTML(item.title || "Unknown");
  const safeImage = escapeAttr(item.image || "images/sights/default.jpg");
  const safeLink = escapeAttr(item.link || "#");
  card.innerHTML = `
    <img src="${safeImage}" alt="${safeTitle}" />
    <button class="star"><img src="images/star_filled.png" alt="star icon" /></button>
    <a href="${safeLink}" target="_blank">
      <div class="info">
        <h3>${safeTitle}</h3>
        <div class="google"><img src="images/google.png" alt="google_icon" /></div>
      </div>
    </a>
  `;
  container.appendChild(card);
  return card;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function escapeAttr(value) {
  return escapeHTML(value).replace(/`/g, "&#96;");
}

function getMapContainer(type) {
  return document.getElementById(type === "sight" ? "liked_sights_map" : "liked_food_map");
}

function getCardsContainer(type) {
  return document.getElementById(type === "sight" ? "liked_sights_cards" : "liked_food_cards");
}

function extractCoordinates(link) {
  if (!link) return null;
  let decoded = link;
  try {
    decoded = decodeURIComponent(link);
  } catch (e) {
    decoded = link;
  }

  const atMatch = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) };

  const placeMatch = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (placeMatch) return { lat: Number(placeMatch[1]), lng: Number(placeMatch[2]) };

  const bingMatch = decoded.match(/[?&]cp=(-?\d+(?:\.\d+)?)~(-?\d+(?:\.\d+)?)/);
  if (bingMatch) return { lat: Number(bingMatch[1]), lng: Number(bingMatch[2]) };

  return null;
}

function getMappedItems(items) {
  return items
    .map((item) => ({ ...item, coords: extractCoordinates(item.link) }))
    .filter((item) => item.coords);
}

function renderMapShell(type, statusText) {
  const mapPanel = getMapContainer(type);
  if (!mapPanel) return null;
  const label = type === "sight" ? "Sights" : "Food";
  mapPanel.innerHTML = `
    <div class="osm_map_wrap">
      <div class="osm_map" id="${type}_osm_map" aria-label="${label} OpenStreetMap"></div>
      <div class="map_overlay">
        <span class="map_count">0 saved ${label.toLowerCase()}</span>
        <span class="map_hint">${escapeHTML(statusText || "")}</span>
      </div>
    </div>
  `;
  return mapPanel.querySelector(".osm_map");
}

function setMapOverlay(type, count, statusText) {
  const mapPanel = getMapContainer(type);
  if (!mapPanel) return;
  const label = type === "sight" ? "sights" : "food";
  const countEl = mapPanel.querySelector(".map_count");
  const hintEl = mapPanel.querySelector(".map_hint");
  if (countEl) countEl.textContent = `${count} saved ${label}`;
  if (hintEl) hintEl.textContent = statusText || "";
}

function makeLeafletIcon(type, index) {
  const className = `leaflet_saved_marker ${type === "sight" ? "leaflet_sight_marker" : "leaflet_food_marker"}`;
  return L.divIcon({
    className: "",
    html: `<div class="${className}">${index + 1}</div>`,
    iconSize: [36, 42],
    iconAnchor: [18, 40],
    popupAnchor: [0, -36],
  });
}

function makePopupContent(item, type) {
  const label = type === "sight" ? "Sight" : "Food";
  return `
    <div class="leaflet_info">
      <img src="${escapeAttr(item.image || "images/sights/default.jpg")}" alt="${escapeAttr(item.title || "Saved place")}" />
      <div>
        <h4>${escapeHTML(item.title || "Unknown")}</h4>
        <p>${label}</p>
        <p>${item.coords.lat.toFixed(5)}, ${item.coords.lng.toFixed(5)}</p>
        <a href="${escapeAttr(item.link || "#")}" target="_blank">Open map link</a>
      </div>
    </div>
  `;
}

function resetLeafletMap(type) {
  const state = mapState[type];
  if (state.map) {
    state.map.remove();
  }
  state.map = null;
  state.markers = [];
  state.bounds = null;
}

function showMarkerInfo(type, index) {
  const state = mapState[type];
  const entry = state.markers[index];
  if (!entry || !state.map) return;
  entry.marker.openPopup();
  state.map.panTo([entry.item.coords.lat, entry.item.coords.lng], { animate: true });
  highlightListCard(type, index);
}

function refreshLeafletMap(type) {
  const state = mapState[type];
  if (!state.map) return;
  setTimeout(() => {
    state.map.invalidateSize();
    if (state.bounds && state.bounds.isValid()) {
      state.map.fitBounds(state.bounds, { padding: [44, 44], maxZoom: 15 });
    }
  }, 80);
}

function highlightListCard(type, index) {
  const container = getCardsContainer(type);
  if (!container) return;
  container.querySelectorAll(".card").forEach((card, cardIndex) => {
    card.classList.toggle("is_active", cardIndex === index);
  });
}

function renderMap(type, items) {
  const mapEl = renderMapShell(type, "Loading OpenStreetMap...");
  if (!mapEl) return;
  const mappedItems = items ? getMappedItems(items) : [];

  if (!window.L) {
    setMapOverlay(type, mappedItems.length, "Leaflet could not load. Check your network connection.");
    return;
  }

  resetLeafletMap(type);
  const state = mapState[type];
  state.map = L.map(mapEl, {
    center: [SHANGHAI_CENTER.lat, SHANGHAI_CENTER.lng],
    zoom: mappedItems.length ? 11 : 10,
    scrollWheelZoom: true,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(state.map);

  if (!mappedItems.length) {
    setMapOverlay(type, 0, "No mapped places yet.");
    return;
  }

  state.bounds = L.latLngBounds([]);
  mappedItems.forEach((item, index) => {
    const marker = L.marker([item.coords.lat, item.coords.lng], {
      icon: makeLeafletIcon(type, index),
      title: item.title || "Saved place",
    })
      .bindPopup(makePopupContent(item, type), {
        closeButton: false,
        maxWidth: 320,
        offset: [0, -8],
      })
      .addTo(state.map);

    marker.on("mouseover", () => showMarkerInfo(type, index));
    marker.on("mouseout", () => highlightListCard(type, -1));
    marker.on("click", () => marker.openPopup());

    state.bounds.extend([item.coords.lat, item.coords.lng]);
    state.markers.push({ marker, item });
  });

  state.map.fitBounds(state.bounds, { padding: [44, 44], maxZoom: 15 });
  setMapOverlay(type, mappedItems.length, "Hover markers or saved cards for details.");
}

async function loadLiked(type) {
  const username = localStorage.getItem("username");
  if (!username) {
    renderMap(type, []);
    return;
  }

  const container = getCardsContainer(type);
  if (!container) return;

  container.innerHTML = "";

  try {
    const resp = await fetch(window.apiUrl(`/api/favorites?username=${encodeURIComponent(username)}&type=${type}`));
    const data = await resp.json();
    if (!resp.ok || !data || !data.ok) throw new Error(data?.msg || "load favorites failed");

    const items = Array.isArray(data.items) ? data.items : [];
    const mappedItems = getMappedItems(items);
    renderMap(type, items);
    if (items.length === 0) {
      container.innerHTML = `<p class="empty">No liked ${type === "sight" ? "sights" : "food"} yet.</p>`;
      return;
    }

    items.forEach((item) => {
      const card = renderCard(container, item);
      const markerIndex = mappedItems.findIndex((mappedItem) => mappedItem.title === item.title);
      if (markerIndex >= 0) {
        card.addEventListener("mouseenter", () => showMarkerInfo(type, markerIndex));
        card.addEventListener("mouseleave", () => highlightListCard(type, -1));
      }
    });
  } catch (e) {
    console.error(e);
    renderMap(type, []);
    container.innerHTML = `<p class="empty">Failed to load favorites.</p>`;
  }
}

window.onload = function () {
  const username = localStorage.getItem("username");
  const name = document.querySelector(".me_info h2");
  if (name) name.textContent = username || "";

  if (typeof ClickLikedFood === "function") {
    ClickLikedFood();
  } else {
    const food = document.getElementById("liked_food");
    const sights = document.getElementById("liked_sights");
    if (food) food.style.display = "block";
    if (sights) sights.style.display = "none";
  }

  if (typeof loadLiked === "function") {
    loadLiked("food");
    setTimeout(() => loadLiked("sight"), 0);
  }
};

//show liked sight
function ClickLikedSight() {
  document.getElementById("liked_food").style.display = "none";
  document.getElementById("liked_sights").style.display = "block";
  refreshLeafletMap("sight");

  document.getElementById("sight_display").style.display = "flex";
  document.getElementById("sight_none").style.display = "none";

  document.getElementById("food_display").style.display = "none";
  document.getElementById("food_none").style.display = "flex";
}

//show liked food
function ClickLikedFood() {
  document.getElementById("liked_food").style.display = "block";
  document.getElementById("liked_sights").style.display = "none";
  refreshLeafletMap("food");

  document.getElementById("sight_display").style.display = "none";
  document.getElementById("sight_none").style.display = "flex";

  document.getElementById("food_display").style.display = "flex";
  document.getElementById("food_none").style.display = "none";
}

function Logout() {
  localStorage.removeItem("username");
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
