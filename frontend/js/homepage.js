window.onload = function () {
  const username = localStorage.getItem("username");
  if (username) {
    const welcome = document.querySelector(".mainsection h1");
    welcome.innerHTML = "Hi! " + username + ",<br />Start your discovery";
  }
};
