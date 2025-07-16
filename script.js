const heading = document.getElementById("greeting");

// Array of full sentences
const sentences = [
  "Lamsogo Thwng-kwrwngrokno",
  "Welcome, Gamers",
  "नमस्ते खिलाड़ी!",
];

let index = 0;

setInterval(() => {
  index = (index + 1) % sentences.length;
  heading.textContent = sentences[index];
}, 3000); //after every 3 seconds

function handleUPIPayment() {
  window.location.href =
    "upi://pay?pa=victotdebbarma-1@oksbi&pn=Victor%20DEBBARMA&am=100&cu=INR&tn=Entry%20Fee";

  // Show the upload section after a delay (optional)
  setTimeout(() => {
    document.getElementById("upload-section").style.display = "block";
  }, 3000); //sfter every 3 seconds
}

const scriptURL =
  "https://script.google.com/macros/s/AKfycbw-dDu6OwyhQonjOI5Any_GHFM2EeGgKSmE7528D4OybVcKicB-ffKekgJGPcV9dGVw/exec"; // Google Sheet Web App
const uploadURL =
  "https://script.google.com/macros/s/AKfycbxLusqkJSqxrXypFDjjiUaFr5BzYXw5MT9VG8JCAL0BjTsG2GmlKcVX2dU5xDHfirsC/exec"; // Google Drive Web App

const form = document.getElementById("e-football-registration-form");
const thankYou = document.getElementById("thank-you-message");
const overlay = document.getElementById("loading-overlay");
const loadingText = document.getElementById("loading-text");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  overlay.style.display = "flex";
  loadingText.textContent = "Uploading image...";

  const formData = new FormData(form);
  const data = {};
  const playtimes = [];

  for (const [key, value] of formData.entries()) {
    if (key === "playtime") {
      playtimes.push(value);
    } else if (key !== "payment-image") {
      data[key] = value;
    }
  }

  data.playtime = playtimes.join(", ");
  let fileURL = "";

  const file = formData.get("payment-image");
  if (file && file.name) {
    try {
      const base64 = await toBase64(file);
      const cleanBase64 = base64.split(",")[1]; // remove 'data:image/...;base64,'

      const uploadForm = new FormData();
      uploadForm.append("filename", file.name);
      uploadForm.append("mimetype", file.type);
      uploadForm.append("data", cleanBase64);

      const res = await fetch(uploadURL, {
        method: "POST",
        body: uploadForm,
      });

      if (!res.ok) throw new Error("Upload failed");

      fileURL = await res.text();
    } catch (err) {
      overlay.style.display = "none";
      alert("File upload failed: " + err.message);
      return;
    }
  }

  data.fileURL = fileURL;

  loadingText.textContent = "Submitting form...";

  try {
    const res = await fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const text = await res.text();

    if (!res.ok || text.includes("Error")) throw new Error(text);

    form.reset();
    thankYou.style.display = "block";
  } catch (err) {
    alert("Error submitting form: " + err.message);
    console.error(err);
  } finally {
    overlay.style.display = "none";
  }
});

// ✅ Helper function to convert file to base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
