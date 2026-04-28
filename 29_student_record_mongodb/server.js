// Assignment 29: Student Record Management System
// Stack: Node.js + Express + MongoDB (Mongoose)
// Run: npm install, then node server.js
// Visit: http://localhost:3000

const express  = require("express");
const mongoose = require("mongoose");
const app      = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Connect to MongoDB ────────────────────────────────────────
mongoose.connect("mongodb://localhost:27017/studentdb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// ── Schema & Model ────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  branch: { type: String, required: true }
});

const Student = mongoose.model("Student", studentSchema);

// ── HTML Page ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Student Record System</title>
  <style>
    body { font-family: Arial; padding: 25px; max-width: 700px; margin: auto; }
    input, select { padding: 9px; margin: 5px; border: 1px solid #ccc; border-radius: 5px; width: 200px; }
    button { padding: 9px 18px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
    th { background: #4CAF50; color: white; }
    .del { background: #e44; padding: 5px 10px; }
    #msg { color: green; font-weight: bold; }
  </style>
</head>
<body>
  <h2>📚 Student Record System</h2>
  <div>
    <input id="name"   placeholder="Student Name">
    <input id="rollNo" placeholder="Roll Number">
    <select id="branch">
      <option value="">-- Branch --</option>
      <option>Computer Science</option>
      <option>Electronics</option>
      <option>Mechanical</option>
      <option>Civil</option>
    </select>
    <button onclick="addStudent()">Add Student</button>
  </div>
  <p id="msg"></p>
  <table>
    <tr><th>Name</th><th>Roll No</th><th>Branch</th><th>Action</th></tr>
    <tbody id="tbody"></tbody>
  </table>
  <script>
    async function load() {
      var res  = await fetch("/students");
      var data = await res.json();
      var html = "";
      data.forEach(s => {
        html += \`<tr><td>\${s.name}</td><td>\${s.rollNo}</td><td>\${s.branch}</td>
                 <td><button class="del" onclick="del('\${s._id}')">Delete</button></td></tr>\`;
      });
      document.getElementById("tbody").innerHTML = html || "<tr><td colspan='4'>No records yet.</td></tr>";
    }

    async function addStudent() {
      var name   = document.getElementById("name").value.trim();
      var rollNo = document.getElementById("rollNo").value.trim();
      var branch = document.getElementById("branch").value;
      if (!name || !rollNo || !branch) { showMsg("Please fill all fields!", "red"); return; }
      var res = await fetch("/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rollNo, branch })
      });
      var data = await res.json();
      showMsg(data.message, data.error ? "red" : "green");
      load();
    }

    async function del(id) {
      await fetch("/students/" + id, { method: "DELETE" });
      showMsg("Student deleted.", "orange");
      load();
    }

    function showMsg(m, c) {
      var el = document.getElementById("msg");
      el.innerText = m; el.style.color = c;
      setTimeout(() => el.innerText = "", 3000);
    }

    load();
  </script>
</body>
</html>
  `);
});

// ── API Routes ────────────────────────────────────────────────
app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post("/students", async (req, res) => {
  try {
    const s = new Student(req.body);
    await s.save();
    res.json({ message: "✅ Student added successfully!" });
  } catch (err) {
    res.json({ error: true, message: "❌ Error: " + (err.code === 11000 ? "Roll No already exists." : err.message) });
  }
});

app.delete("/students/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
