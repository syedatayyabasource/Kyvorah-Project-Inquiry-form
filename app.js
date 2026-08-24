const form = document.getElementById("projectForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const banner = document.getElementById("banner");
const message = document.getElementById("message");
const counter = document.getElementById("counter");
const dateInput = document.getElementById("date");

const today = new Date().toISOString().slice(0, 10);
dateInput.min = today;

const fields = ["fullName", "email", "phone", "service", "date", "budget", "projectFile", "message"];

function errorElement(name) {
  return name === "projectFile" ? document.getElementById("fileError") : document.getElementById(`${name}Error`);
}
function setError(name, text = "") {
  const el = document.getElementById(name);
  if (!el) return;
  const field = el.closest(".field");
  field.classList.toggle("invalid", Boolean(text));
  errorElement(name).textContent = text;
}
function showBanner(type, text) {
  banner.className = `banner show ${type}`;
  banner.textContent = text;
}
function clearBanner() {
  banner.className = "banner";
  banner.textContent = "";
}

function validateClient() {
  const data = new FormData(form);
  const errors = {};
  const fullName = data.get("fullName").trim();
  const email = data.get("email").trim();
  const phone = data.get("phone").trim();
  const service = data.get("service");
  const date = data.get("date");
  const text = data.get("message").trim();
  const file = data.get("projectFile");

  if (fullName.length < 3) errors.fullName = "Please enter your full name (at least 3 characters).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid work email address.";
  if (!/^\+?[0-9\s()-]{7,18}$/.test(phone)) errors.phone = "Please enter a valid phone number.";
  if (!service) errors.service = "Please select the service you need.";
  if (!date) errors.date = "Please select a preferred discussion date.";
  else if (date < today) errors.date = "Please choose today or a future date.";
  if (!file || !file.name) errors.projectFile = "Please attach a project brief or reference file.";
  else if (file.size > 5 * 1024 * 1024) errors.projectFile = "The selected file is larger than 5 MB.";
  else if (!["application/pdf","image/jpeg","image/png","image/webp","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
    errors.projectFile = "Please upload a PDF, DOC, DOCX, JPG, PNG or WEBP file.";
  }
  if (text.length < 30) errors.message = "Please describe your requirements in at least 30 characters.";

  fields.forEach(name => setError(name, errors[name] || ""));
  return errors;
}

message.addEventListener("input", () => {
  if (message.value.length > 700) message.value = message.value.slice(0, 700);
  counter.textContent = `${message.value.length} / 700`;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearBanner();

  const errors = validateClient();
  if (Object.keys(errors).length) {
    showBanner("error", "Please review the highlighted fields and try again.");
    const first = Object.keys(errors)[0];
    document.getElementById(first).focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.classList.add("loading");
  btnText.textContent = "Sending...";

  try {
    const response = await fetch("/api/submit", { method: "POST", body: new FormData(form) });
    const result = await response.json();

    if (!response.ok) {
      Object.entries(result.errors || {}).forEach(([name, text]) => setError(name === "file" ? "projectFile" : name, text));
      showBanner("error", result.message || "Submission failed. Please check your details.");
      return;
    }

    showBanner("success", `${result.message} Reference: ${result.submissionId}`);
    form.reset();
    counter.textContent = "0 / 700";
    dateInput.min = today;
    fields.forEach(name => setError(name, ""));
  } catch {
    showBanner("error", "Unable to reach Kyvorah's server. Please make sure the backend is running.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
    btnText.textContent = "Send project inquiry";
  }
});

fields.forEach(name => {
  const el = document.getElementById(name);
  el.addEventListener("input", () => setError(name, ""));
  el.addEventListener("change", () => setError(name, ""));
});
