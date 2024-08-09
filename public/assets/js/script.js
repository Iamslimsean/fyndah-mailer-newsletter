const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", function () {
  // retrict input to 5 lines
  document.getElementById("email").addEventListener("input", function () {
    const maxLines = 2500;
    let value = this.value;
    let lines = value.split("\n");

    // Prevent spaces
    value = value.replace(/ /g, "");

    // Restrict to maxLines
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      value = lines.join("\n");
    } else {
      // Ensure no new lines beyond maxLines
      let newLines = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] === "\n") {
          newLines++;
          if (newLines >= maxLines) {
            value = value.substring(0, i);
            break;
          }
        }
      }
    }
    this.value = value;
  });

  const csvInput = document.getElementById("csvInput");
  const textArea = document.getElementById("email");
  const htmlTemp = document.getElementById("htmlTemp");
  const button = document.getElementById("send-btn");
  let csvArray = [];

  const defaultContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Information</title>
  <style>
  * {
      box-sizing: border-box;
  }
  html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
  }
  body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
  }
  .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      overflow: hidden; /* Prevents content overflow */
  }
  .header {
      text-align: center;
      background-color: #007bff;
      color: #ffffff;
      padding: 10px 0;
      border-radius: 10px 10px 0 0;
  }
  .header h1 {
      margin: 0;
  }
  .content {
      padding: 20px;
  }
  .content h2 {
      color: #333333;
  }
  .content p {
      line-height: 1.6;
      color: #666666;
  }
  .footer {
      text-align: center;
      padding: 10px 0;
      color: #999999;
      font-size: 12px;
  }
  .footer a {
      color: #007bff;
      text-decoration: none;
  }
  .footer a:hover {
      text-decoration: underline;
  }
  </style>
  </head>
  <body>
  </body>
  </html>`;

  htmlTemp.value = defaultContent.trim();

  csvInput.addEventListener("change", (e) => {
    const file = csvInput.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const csvData = reader.result;
      let rows = csvData.split("\n");

      // Limit the number of rows to 2500
      if (rows.length > 2500) {
        rows = rows.slice(0, 2500);
      }

      const csvArray = rows.map((row) => {
        return row.split(",");
      });

      textArea.value = csvArray.join("\n");
      console.log(csvArray);
    };
  });

  const form = document.querySelector(".signupForm");
  const terminalDiv = document.querySelector(".terminal");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const subject = document.querySelector("#subject").value;
    const replyto = document.querySelector("#replyto").value;
    const html = document.querySelector("#htmlTemp").value;
    const uploadedEmails = document
      .querySelector("#email")
      .value.split("\n")
      .map((info) => info.trim().replace(/^"+|"+$/g, ""))
      .filter(Boolean);

    const terminalMessage = document.createElement("p");

    terminalMessage.className = "success";
    terminalMessage.innerText = "Sending..........";
    terminalDiv.appendChild(terminalMessage);
    let success = true;
    for (const email of uploadedEmails) {
      console.log(email);
      try {
        button.disabled = true;
        const response = await fetch(
          // http://localhost:8080
          "https://api-fyndah-mailer.onrender.com/api/v1/send/auth/email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: email,
              replyto: replyto,
              subject: subject,
              html: html,
            }),
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          success = false;
          window.location.href = "/";
          break;
        }

        if (response.ok) {
          success = true;
          const terminalMessage = document.createElement("p");
          terminalMessage.className = "success";
          terminalMessage.innerText = data.description;
          terminalDiv.appendChild(terminalMessage);
        } else {
          success = false;

          const terminalMessage = document.createElement("p");
          terminalMessage.className = "error";
          terminalMessage.innerText = data.description;
          terminalDiv.appendChild(terminalMessage);
        }
      } catch (error) {
        success = false;
        button.disabled = false;
        terminalMessage.className = "error";
        terminalMessage.innerText = `Failed to send to ${email} || Detail message ====> ${error}`;
        terminalDiv.appendChild(terminalMessage);

        iziToast.error({
          message: error.message,
          position: "topRight",
          drag: false,
          displayMode: 1,
        });
        break;
      }
    }
    button.disabled = false;
    if (success) {
      iziToast.success({
        message: "All Email(s) has been sent! 😊👍",
        position: "topRight",
        drag: false,
        displayMode: 1,
      });
    }
  });
});
