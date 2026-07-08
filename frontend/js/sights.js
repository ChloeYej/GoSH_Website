//homepage transition animation
window.addEventListener("load", function () {
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) target.classList.add("highlight");
  }
});

//move cards
let current_L = 0;
const L = document.getElementById("Landmarks");
const L_card = L.querySelectorAll(".card");
const cnt_L = L_card.length;

function MoveLandmarks(direction) {
  const width_L = L_card[current_L].offsetWidth + 25;
  if (direction === 1 && current_L < cnt_L - 4) {
    current_L++;
  } else if (direction === -1 && current_L > 0) {
    current_L--;
  } else {
    alert("No more sights.");
  }
  L.style.transform = `translateX(-${current_L * width_L}px)`;
}

//move museums
let current_M = 0;
const M = document.getElementById("Museums");
const M_card = M.querySelectorAll(".card");
const cnt_M = M_card.length;

function MoveMuseums(direction) {
  const width_M = M_card[current_M].offsetWidth + 25;
  if (direction === 1 && current_M < cnt_M - 4) {
    current_M++;
  } else if (direction === -1 && current_M > 0) {
    current_M--;
  } else {
    alert("No more sights.");
  }
  M.style.transform = `translateX(-${current_M * width_M}px)`;
}

//move parks
let current_P = 0;
const P = document.getElementById("Parks");
const P_card = P.querySelectorAll(".card");
const cnt_P = P_card.length;

function MoveParks(direction) {
  const width_P = P_card[current_P].offsetWidth + 25;
  if (direction === 1 && current_P < cnt_P - 4) {
    current_P++;
  } else if (direction === -1 && current_P > 0) {
    current_P--;
  } else {
    alert("No more sights.");
  }
  P.style.transform = `translateX(-${current_P * width_P}px)`;
}

//move blocks
let current_B = 0;
const B = document.getElementById("Blocks");
const B_card = B.querySelectorAll(".card");
const cnt_B = B_card.length;

function MoveBlocks(direction) {
  const width_B = B_card[current_B].offsetWidth + 25;
  if (direction === 1 && current_B < cnt_B - 4) {
    current_B++;
  } else if (direction === -1 && current_B > 0) {
    current_B--;
  } else {
    alert("No more sights.");
  }
  B.style.transform = `translateX(-${current_B * width_B}px)`;
}

//responsive
function updateTransforms() {
  const width_L = L_card[0].offsetWidth + 25;
  const width_M = M_card[0].offsetWidth + 25;
  const width_P = P_card[0].offsetWidth + 25;
  const width_B = B_card[0].offsetWidth + 25;

  L.style.transform = `translateX(-${current_L * width_L}px)`;
  M.style.transform = `translateX(-${current_M * width_M}px)`;
  P.style.transform = `translateX(-${current_P * width_P}px)`;
  B.style.transform = `translateX(-${current_B * width_B}px)`;
}
window.addEventListener("resize", updateTransforms);
window.addEventListener("load", updateTransforms);

//toggle star
async function toggleStar(element) {
  const img = element.querySelector("img");
  const filled = img.src.includes("star_filled.png");
  const username = localStorage.getItem("username");
  if (!username) return alert("Please log in first.");

  // get content
  const card = element.closest(".card");
  const titleEl = card.querySelector(".info h3, .info h4, h3, h4");
  const title = titleEl ? titleEl.textContent.trim() : "Unknown";
  
  const photoEl = card.querySelector("img:not(.star img)");
  const firstImg = card.querySelector(":scope > img") || photoEl;
  const image = firstImg ? firstImg.getAttribute("src") : "";
  const linkEl = card.querySelector("a[href]");
  const link = linkEl ? linkEl.href : "";

  try {
    if (!filled) {
      // add star
      const resp = await fetch(window.apiUrl("/api/favorites"), {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, type: "sight", title, image, link })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) throw new Error(data.msg || "favorite failed");
      img.src = "images/star_filled.png";
    } else {
      // delete star
      const resp = await fetch(window.apiUrl("/api/favorites"), {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, type: "sight", title })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) throw new Error(data.msg || "unfavorite failed");
      img.src = "images/star.png";
    }
  } catch (e) {
    console.error(e);
    alert(e.message || "Network error");
  }
}


async function markStarsFromFavorites() {
  const username = localStorage.getItem("username");
  if (!username) return;

  let favs = [];
  try {
    const resp = await fetch(window.apiUrl(`/api/favorites?username=${encodeURIComponent(username)}&type=sight`));
    const data = await resp.json();
    if (resp.ok && data && data.ok && Array.isArray(data.items)) {
      favs = data.items;
    }
  } catch (e) {
    console.error("[favorites] fetch failed:", e);
  }
  const favSet = new Set(favs.map(x => (x.title || "").trim()));
  
  document.querySelectorAll(".card").forEach(card => {
    const titleEl = card.querySelector(".info h3, .info h4, h3, h4");
    const title = titleEl ? titleEl.textContent.trim() : "";
    const starImg = card.querySelector(".star img") || card.querySelector('img[data-role="star"]');
    if (!starImg) return;

    if (favSet.has(title)) {
      starImg.src = "images/star_filled.png";
    } else {
      starImg.src = "images/star.png";
    }
  });
}


document.addEventListener("DOMContentLoaded", () => {
  markStarsFromFavorites();
});

