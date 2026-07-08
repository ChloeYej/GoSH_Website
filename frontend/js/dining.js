window.addEventListener("load", function () {
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) target.classList.add("highlight");
  }
});


async function postJSON(path, payload, method = "POST") {
  const resp = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  let data = null;
  try { data = await resp.json(); } catch {}
  return { ok: resp.ok && data && data.ok, status: resp.status, data };
}


let currentPage = 1;
const num = 8;
let currentCategoryId = "1";

function initialize(categoryId) {
  const category = document.getElementById(categoryId);
  const cards = category.querySelectorAll(".card");
  cards.forEach((card) => (card.style.display = "none"));
  for (let i = 0; i < num; i++) if (cards[i]) cards[i].style.display = "block";
  currentPage = 1;
}

// GetCategory
function GetCategory(selected) {
  const option = selected.value;
  if (option == "1") Show_1();
  else if (option == "2") Show_2();
  else if (option == "3") Show_3();
}


function Show_1() {
  document.getElementById("1").style.display = "grid";
  document.getElementById("2").style.display = "none";
  document.getElementById("3").style.display = "none";
  currentCategoryId = "1";
  initialize(currentCategoryId);
  
  markStarsFromFavorites();
}
function Show_2() {
  document.getElementById("2").style.display = "grid";
  document.getElementById("1").style.display = "none";
  document.getElementById("3").style.display = "none";
  currentCategoryId = "2";
  initialize(currentCategoryId);
  markStarsFromFavorites();
}
function Show_3() {
  document.getElementById("3").style.display = "grid";
  document.getElementById("2").style.display = "none";
  document.getElementById("1").style.display = "none";
  currentCategoryId = "3";
  initialize(currentCategoryId);
  markStarsFromFavorites();
}

function NextPage() {
  const category = document.getElementById(currentCategoryId);
  const cards = category.querySelectorAll(".card");
  const cnt_cards = cards.length;
  const cnt_pages = Math.ceil(cnt_cards / num);
  if (currentPage >= cnt_pages) return alert("This is the last page.");

  
  for (let i = (currentPage - 1) * num; i < currentPage * num; i++)
    if (cards[i]) cards[i].style.display = "none";
  currentPage++;
 
  for (let i = (currentPage - 1) * num; i < currentPage * num; i++)
    if (cards[i]) cards[i].style.display = "block";

  markStarsFromFavorites();
}
function LastPage() {
  const category = document.getElementById(currentCategoryId);
  const cards = category.querySelectorAll(".card");
  if (currentPage <= 1) return alert("This is the first page.");

  for (let i = (currentPage - 1) * num; i < currentPage * num; i++)
    if (cards[i]) cards[i].style.display = "none";
  currentPage--;
  for (let i = (currentPage - 1) * num; i < currentPage * num; i++)
    if (cards[i]) cards[i].style.display = "block";

  markStarsFromFavorites();
}


async function markStarsFromFavorites() {
  const username = localStorage.getItem("username");
  if (!username) return;

  let favs = [];
  try {
    const resp = await fetch(
      `/api/favorites?username=${encodeURIComponent(username)}&type=food`
    );
    const data = await resp.json();
    if (resp.ok && data && data.ok && Array.isArray(data.items)) favs = data.items;
  } catch (e) {
    console.error("[favorites-food] fetch failed:", e);
  }

  const favSet = new Set(favs.map((x) => (x.title || "").trim()));

 
  const category = document.getElementById(currentCategoryId);
  if (!category) return;
  category.querySelectorAll(".card").forEach((card) => {
    const titleEl = card.querySelector(".info h3, .info h4, h3, h4");
    const title = titleEl ? titleEl.textContent.trim() : "";
    const starImg = card.querySelector(".star img");
    if (!starImg) return;
    starImg.src = favSet.has(title) ? "images/star_filled.png" : "images/star.png";
  });
}


async function toggleStar(element) {
  const img = element.querySelector("img") || element;
  const isFilled = img.src.includes("star_filled.png");
  const username = localStorage.getItem("username");
  if (!username) return alert("Please log in first.");

  
  const card = element.closest(".card");
  const titleEl = card.querySelector(".info h3, .info h4, h3, h4");
  const title = titleEl ? titleEl.textContent.trim() : "Unknown";
  const photoEl =
    card.querySelector(":scope > img") || card.querySelector("img:not(.star img)");
  const image = photoEl ? photoEl.getAttribute("src") : "";
  const linkEl = card.querySelector("a[href]");
  const link = linkEl ? linkEl.href : "";

  try {
    if (!isFilled) {
      const r = await postJSON("/api/favorites", {
        username,
        type: "food",
        title,
        image,
        link,
      });
      if (!r.ok) throw new Error(r.data?.msg || "favorite failed");
      img.src = "images/star_filled.png";
    } else {
      const r = await postJSON(
        "/api/favorites",
        { username, type: "food", title },
        "DELETE"
      );
      if (!r.ok) throw new Error(r.data?.msg || "unfavorite failed");
      img.src = "images/star.png";
    }
  } catch (e) {
    console.error(e);
    alert(e.message || "Network error");
  }
}


document.addEventListener("DOMContentLoaded", () => {
  initialize(currentCategoryId);
  markStarsFromFavorites();
});

window.toggleStar = toggleStar;
console.log("[dining.js] loaded");

