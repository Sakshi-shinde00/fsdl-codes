// Assignment 30: Event Registration System
// Stack: Node.js + Express + MongoDB (Mongoose)
// Run: npm install, then node server.js
// Visit: http://localhost:3001

const express  = require("express");
const mongoose = require("mongoose");
const app      = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/eventdb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ Error:", err));

const regSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  eventName: { type: String, required: true },
  regDate:   { type: Date, default: Date.now }
});

const Registration = mongoose.model("Registration", regSchema);

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Event Registration</title>
  <style>
    body { font-family: Arial; padding: 25px; max-width: 700px; margin: auto; background: #f5f5f5; }
    .form-box { background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; }
    h2 { color: #9C27B0; }
    input, select { display: block; width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
    button { padding: 10px 25px; background: #9C27B0; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 15px; }
    table { border-collapse: collapse; width: 100%; background: white; border-radius: 10px; overflow: hidden; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
    th { background: #9C27B0; color: white; }
    tr:nth-child(even) { background: #f9f9f9; }
    #msg { font-weight: bold; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="form-box">
    <h2>🎪 Event Registration</h2>
    <input id="name"  placeholder="Full Name">
    <input id="email" type="email" placeholder="Email Address">
    <select id="event">
      <option value="">-- Select Event --</option>
      <option>Tech Fest 2025</option>
      <option>Cultural Night</option>
      <option>Sports Day</option>
      <option>Hackathon</option>
      <option>Science Exhibition</option>
    </select>
    <button onclick="register()">Register</button>
    <p id="msg"></p>
  </div>

  <h3>Registered Participants</h3>
  <table>
    <tr><th>Name</th><th>Email</th><th>Event</th><th>Date</th></tr>
    <tbody id="tbody"></tbody>
  </table>

  <script>
    async function load() {
      var res  = await fetch("/registrations");
      var data = await res.json();
      var html = "";
      data.forEach(r => {
        var d = new Date(r.regDate).toLocaleDateString();
        html += \`<tr><td>\${r.name}</td><td>\${r.email}</td><td>\${r.eventName}</td><td>\${d}</td></tr>\`;
      });
      document.getElementById("tbody").innerHTML = html || "<tr><td colspan='4'>No registrations yet.</td></tr>";
    }

    async function register() {
      var name      = document.getElementById("name").value.trim();
      var email     = document.getElementById("email").value.trim();
      var eventName = document.getElementById("event").value;
      if (!name || !email || !eventName) { show("Please fill all fields!", "red"); return; }
      var res  = await fetch("/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, eventName })
      });
      var data = await res.json();
      show(data.message, "green");
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("event").value = "";
      load();
    }

    function show(m, c) {
      var el = document.getElementById("msg");
      el.innerText = m; el.style.color = c;
    }

    load();
  </script>
</body>
</html>
  `);
});

app.get("/registrations", async (req, res) => {
  const regs = await Registration.find().sort({ regDate: -1 });
  res.json(regs);
});

app.post("/registrations", async (req, res) => {
  try {
    const r = new Registration(req.body);
    await r.save();
    res.json({ message: "✅ Registered successfully for " + req.body.eventName + "!" });
  } catch (err) {
    res.json({ message: "❌ Error: " + err.message });
  }
});

app.listen(3001, () => console.log("🚀 Server running at http://localhost:3001"));
