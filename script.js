function validateForm() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "" || password === "") {
    alert("Please fill in both fields.");
    return false;
  }

  alert("Login successful!");
  return true;
}
