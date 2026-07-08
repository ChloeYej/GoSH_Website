async function api(path, payload) {
  const resp = await fetch(path, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload || {})
  });
  let data = null;
  try { data = await resp.json(); } catch {}
  return { ok: resp.ok && data && data.ok, status: resp.status, data };
}

async function Login() {
  const username = document.getElementById("name").value.trim();
  const password = document.getElementById("password").value;

  if (!username) return alert("Please enter your username.");
  if (!password) return alert("Please enter your password.");

  // 调后端 /api/login
  const r = await api("/api/login", { username, password });
  if (!r.ok) {
    alert((r.data && r.data.msg) || "Login failed");
    return;
  }

  // 最小会话存储（演示用）
  localStorage.setItem("username", r.data.user.username);
  localStorage.setItem("token", r.data.token);
  window.location.href = "homepage.html";
}

async function SignupFlow() {
  const username = prompt("Create a username:");
  if (!username) return;
  const password = prompt("Create a password:");
  if (!password) return;

  const r = await api("/api/signup", { username, password });
  if (!r.ok) {
    alert((r.data && r.data.msg) || "Sign up failed");
    return;
  }
  alert("Sign up success! Now you can log in.");
}

// 绑定“Sign up”点击事件
document.addEventListener("DOMContentLoaded", () => {
  const a = document.getElementById("signup-link");
  if (a) a.addEventListener("click", (e) => {
    e.preventDefault();
    SignupFlow();
  });
});

