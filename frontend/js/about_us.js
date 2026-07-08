const form = document.getElementById("con_form");

form.addEventListener("submit", function (event) {
  if (form.checkValidity()) {
    alert("Submit successfully!");
  }
});
