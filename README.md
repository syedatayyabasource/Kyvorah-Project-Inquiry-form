# Kyvorah Project Inquiry

A full-stack project inquiry form made for Kyvorah Software Solutions.

The form allows clients to share their project details, choose a service, select a preferred date, upload a project brief, and send their requirements.

## Features

- Project inquiry form
- Full name, email and phone fields
- Service selection
- Preferred discussion date
- Budget selection
- Project brief upload
- Project requirements textarea
- Frontend form validation
- Backend validation with Express
- File type and size validation
- Loading state while submitting
- Success and error messages
- Submission reference number

## Tech Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- Multer

## How to Run

Clone the repository and open the project folder:

```bash
cd week3_form_validation

Install the dependencies:

npm install

Start the server:

npm start

Then open:

http://localhost:5000
Project Structure
week3_form_validation/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── uploads/
├── package.json
├── server.js
└── README.md
Form Validation

The form checks the entered information before sending it to the server.

The backend also validates the submitted data, so invalid information is not accepted even if frontend validation is bypassed.

Uploaded files are limited to supported document/image formats and a maximum size of 5 MB.

About the Project

This project was built as part of my Full Stack Web Development internship and adapted as a practical project inquiry form for Kyvorah Software Solutions.

It can later be connected with a database, email notifications, or an admin panel to manage client inquiries.
