// const express = require("express");
// const nodemailer = require("nodemailer");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// app.post("/send-mail", async (req, res) => {
//   const { contacts } = req.body;

//   if (!contacts || contacts.length === 0) {
//     return res.status(400).json({ message: "No contacts provided" });
//   }

//   try {
//     for (let contact of contacts) {
//       await transporter.sendMail({
//         from: `"My CRM" <${process.env.EMAIL_USER}>`,
//         to: contact.email,
//         subject: "Welcome to CRM 🚀",
//         html: `
//           <h2>Hello ${contact.name},</h2>
//           <p>This is a real email from CRM system.</p>
//         `,
//       });
//     }

//     res.json({ message: "Email sent successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Email failed" });
//   }
// });

// app.listen(process.env.PORT, () => {
//   console.log("Server running on port", process.env.PORT);
// });
