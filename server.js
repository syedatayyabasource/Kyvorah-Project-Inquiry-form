const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Please upload a PDF, DOC, DOCX, JPG, PNG or WEBP file."));
    }
    cb(null, true);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function validateForm(body, file) {
  const errors = {};
  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const service = String(body.service || "").trim();
  const date = String(body.date || "").trim();
  const message = String(body.message || "").trim();
  const website = String(body.website || "").trim();

  const allowedServices = [
    "AI & ML Solution",
    "Web Development",
    "Full-Stack Application",
    "UI/UX Design",
    "Custom Software"
  ];

  if (fullName.length < 3) errors.fullName = "Full name must contain at least 3 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid work email address.";
  if (!/^\+?[0-9\s()-]{7,18}$/.test(phone)) errors.phone = "Enter a valid phone number.";
  if (!allowedServices.includes(service)) errors.service = "Please select a valid service.";
  if (!date) errors.date = "Please choose a preferred discussion date.";
  if (date && date < new Date().toISOString().slice(0, 10)) errors.date = "Discussion date cannot be in the past.";
  if (message.length < 30) errors.message = "Project requirements must contain at least 30 characters.";
  if (website) errors.website = "This field must remain empty.";
  if (!file) errors.file = "Please attach a project brief or reference file.";

  return errors;
}

app.post("/api/submit", upload.single("projectFile"), (req, res) => {
  const errors = validateForm(req.body, req.file);

  if (Object.keys(errors).length) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({
      success: false,
      message: "Please correct the highlighted fields before submitting.",
      errors
    });
  }

  const submission = {
    id: `KYV-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    fullName: req.body.fullName.trim(),
    email: req.body.email.trim(),
    phone: req.body.phone.trim(),
    service: req.body.service,
    date: req.body.date,
    budget: req.body.budget || "Not specified",
    message: req.body.message.trim(),
    file: req.file.filename
  };

  fs.appendFileSync(
    path.join(__dirname, "submissions.json"),
    JSON.stringify(submission) + "\n",
    "utf8"
  );

  res.json({
    success: true,
    message: "Thank you. Your project inquiry has been received by Kyvorah.",
    submissionId: submission.id
  });
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "The uploaded file is too large.",
      errors: { file: "Maximum file size is 5 MB." }
    });
  }
  if (err) return res.status(400).json({ success: false, message: err.message || "Unable to process the submission." });
  res.status(500).json({ success: false, message: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Kyvorah project inquiry is running at http://localhost:${PORT}`);
});
