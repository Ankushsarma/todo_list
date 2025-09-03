const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/toDo_list")
    .then(() => console.log("Database connected"))
    .catch(() => console.log("Database connection error"));

// Schemas
const userSchema = new mongoose.Schema({
    name: String,
    userId: String,
    password: String
});

const taskSchema = new mongoose.Schema({
    userId: String,
    task: [
        {
            text: String,
            completed: { type: Boolean, default: false },
            dueDate: { type: Date } ,
            date:{type:Date,default:Date.now}
        }
    ]
});

// Models
const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "secretkey", resave: false, saveUninitialized: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Routes

// Register
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        const { name, userId, password } = req.body;
        const existingUser = await User.findOne({ userId });
        if (existingUser) return res.send("User ID already exists");

        const newUser = new User({ name, userId, password });
        await newUser.save();
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error during registration");
    }
});

// Login
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const { userId, password } = req.body;
        const user = await User.findOne({ userId });
        if (!user) return res.send("No user found");
        if (user.password !== password) return res.send("Incorrect password");

        req.session.credentials = user;
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error during login");
    }
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// Home
app.get("/", async (req, res) => {
    const user = req.session.credentials;
    if (!user) return res.redirect("/login");

    const filter = req.query.filter; 

    try {
        const userTasks = await Task.findOne({ userId: user.userId });
        let tasks = userTasks ? [...userTasks.task] : [];

        const now = new Date();

        if (!filter || filter === "none") {
            tasks = tasks.filter(t => !t.completed); 
        } else if (filter === "priority") {
            tasks = tasks.filter(t => !t.completed).sort((a, b) => a.priority - b.priority);
        } else if (filter === "timeLeft") {
            tasks = tasks.filter(t => !t.completed && t.dueDate)
                         .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        }

        res.render("home", {
            name: user.name,
            tasks,
            filter: filter || "none"
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching tasks");
    }
});


// Add task
app.post("/", async (req, res) => {
  const user = req.session.credentials;
  if (!user) return res.redirect("/login");

  try {
    const { task, dueDate, priority } = req.body;

    let userTasks = await Task.findOne({ userId: user.userId });

    // Check duplicate task name
    if (userTasks && userTasks.task.some(t => t.text.toLowerCase() === task.toLowerCase())) {
      return res.send("Task with same name already exists!");
    }

    const newTaskObj = {
      text: task,
      completed: false,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority ? Number(priority) : 2
    };

    if (userTasks) {
      userTasks.task.push(newTaskObj);
      await userTasks.save();
    } else {
      const newTask = new Task({
        userId: user.userId,
        task: [newTaskObj]
      });
      await newTask.save();
    }

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding task");
  }
});


// Mark as done
app.get("/marks_as_done/:taskId", async (req, res) => {
    const user = req.session.credentials;
    if (!user) return res.redirect("/login");

    const { taskId } = req.params;

    try {
        await Task.updateOne(
            { userId: user.userId, "task._id": taskId },
            { $set: { "task.$.completed": true } }
        );
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error marking task as done");
    }
});

// Remove task
app.get("/remove_task/:taskId", async (req, res) => {
    const user = req.session.credentials;
    if (!user) return res.redirect("/login");

    const { taskId } = req.params;

    try {
        await Task.updateOne(
            { userId: user.userId },
            { $pull: { task: { _id: taskId } } }
        );
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error removing task");
    }
});

app.get("/history",async(req,res)=>{
    const user = req.session.credentials;
    if (!user) return res.redirect("/login");

    try {
        const userTasks = await Task.findOne({ userId: user.userId });
        res.render("history", {
            name: user.name,
            tasks: userTasks ? userTasks.task : []
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching tasks");
    }
})

// Start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
