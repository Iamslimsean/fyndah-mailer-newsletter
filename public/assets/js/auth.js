document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("login-btn");
  const form = document.getElementById("signInForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    button.disabled = true;
    
    button.textContent = "Please wait...";

    const userName = document.getElementById("user-name").value;

    const password = document.getElementById("password").value;

    try {
      const response = await fetch(
        // http://localhost:8080
        "https://api-fyndah-mailer.onrender.com/api/v1/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password, site_id: "fyndah-mailer-newsletter" }),
      });

      const data = await response.json();

      console.log(data)

      button.disabled = false;
      button.textContent = "Log In";

      if (response.ok) {
        const token = data.data.token;

        localStorage.setItem("token", token);
                 
        iziToast.success({
          message: "Login Successful 😊👍",
          position: "topRight",
          drag: false,
          displayMode: 1,
        });

        window.location.href = '/mailer.html';

      } else {
        iziToast.error({
          message: data.description || "Login failed",
          position: "topRight",
          drag: false,
          displayMode: 1,
        });
      }
    } catch (error) {
      button.disabled = false;
      button.textContent = "Log In";
      iziToast.error({
        message: "Network error, please try again",
        position: "topRight",
        drag: false,
        displayMode: 1,
      });
      console.error("Error during login:", error);
    }
  });
});
