function renderCard(container, item) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${item.image || "images/sights/default.jpg"}" alt="${item.title || ""}" />
    <button class="star"><img src="images/star_filled.png" alt="star icon" /></button>
    <a href="${item.link || "#"}" target="_blank">
      <div class="info">
        <h3>${item.title || "Unknown"}</h3>
        <div class="google"><img src="images/google.png" alt="google_icon" /></div>
      </div>
    </a>
  `;
  container.appendChild(card);
}

async function loadLiked(type) {
  const username = localStorage.getItem("username");
  if (!username) return;

  const container = document.getElementById(
    type === "sight" ? "liked_sights_cards" : "liked_food_cards"
  );
  if (!container) return;

  // clear
  container.innerHTML = "";

  try {
    const resp = await fetch(`/api/favorites?username=${encodeURIComponent(username)}&type=${type}`);
    const data = await resp.json();
    if (!resp.ok || !data || !data.ok) throw new Error(data?.msg || "load favorites failed");

    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) {
      container.innerHTML = `<p class="empty">No liked ${type === "sight" ? "sights" : "food"} yet.</p>`;
      return;
    }
    items.forEach(item => renderCard(container, item));
  } catch (e) {
    console.error(e);
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

  document.getElementById("sight_display").style.display = "flex";
  document.getElementById("sight_none").style.display = "none";

  document.getElementById("food_display").style.display = "none";
  document.getElementById("food_none").style.display = "flex";
}

//show liked food
function ClickLikedFood() {
  document.getElementById("liked_food").style.display = "block";
  document.getElementById("liked_sights").style.display = "none";

  document.getElementById("sight_display").style.display = "none";
  document.getElementById("sight_none").style.display = "flex";

  document.getElementById("food_display").style.display = "flex";
  document.getElementById("food_none").style.display = "none";
}

function Logout() {
  window.location.href = "index.html";
}
