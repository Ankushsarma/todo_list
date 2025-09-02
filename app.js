const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://localhost:27017/toDo_list")
    .then(() => console.log("database is connected"))
    .catch(() => console.log("error"));

const userSchema = new mongoose.Schema({
    name: String,
    userId: String,
    password: String
});

const TaskSchema = new mongoose.Schema({
    userId: String,
    task: [
        {
            text: String,
            completed: {
                type: Boolean,
                default: false
            }
        }
    ]
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', TaskSchema);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "secretkey", resave: false, saveUninitialized: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/login", (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const credentials = req.body;
        
        const userFound = await User.findOne({ userId: credentials.userId });

        if (userFound) {
            if (credentials.password === userFound.password) {
                req.session.credentials = userFound; 
                res.redirect('/');
            } else {
                res.send('Incorrect password');
            }
        } else {
            res.send('No user found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error during login");
    }
});

app.get("/", async (req, res) => {
    const userCredentials = req.session.credentials;

    if (userCredentials) {
        try {
           
            const userTasks = await Task.findOne({ userId: userCredentials.userId });

            res.render("home", { 
                name: userCredentials.name,          
                tasks: userTasks ? userTasks.task : [] 
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Error fetching tasks");
        }
    } else {
        res.redirect('/login');
    }
});

app.post("/", async (req, res) => {
    const userCredentials = req.session.credentials;

    if (!userCredentials) {
        return res.redirect("/login");
    }

    try {
        const { task } = req.body;

        // Find the user's tasks
        let userTasks = await Task.findOne({ userId: userCredentials.userId });

        if (userTasks) {
            // Push new task as an object
            userTasks.task.push({ text: task, completed: false });
            await userTasks.save();
        } else {
            // Create a new task document for the user
            const newTask = new Task({
                userId: userCredentials.userId,
                task: [{ text: task, completed: false }]
            });
            await newTask.save();
        }

        res.redirect("/"); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding task");
    }
});


app.get('/marks_as_done/:taskId', async (req, res) => {
    const { taskId } = req.params;

    try {
        await Task.updateOne(
            { "task._id": taskId },
            { $set: { "task.$.completed": true } }
        );

        res.redirect('/'); // redirect back to the list page
    } catch (err) {
        console.error(err);
        res.status(500).send('Error marking task as done');
    }
});
app.get("/remove_task/:taskId", async (req, res) => {
    const userCredentials = req.session.credentials;

    if (!userCredentials) {
        return res.redirect("/login");
    }

    const { taskId } = req.params;

    try {
        // Remove the task from the user's task array
        await Task.updateOne(
            { userId: userCredentials.userId },
            { $pull: { task: { _id: taskId } } }
        );

        res.redirect("/"); // redirect back to home
    } catch (err) {
        console.error(err);
        res.status(500).send("Error removing task");
    }
});


app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        const { name, userId, password } = req.body;
        const isUserID = await User.findOne({ userId: userId });

        if (!isUserID) {
            const newUser = new User({ name, userId, password });
            await newUser.save();
            res.redirect("/login");
        } else {
            res.send("User ID already exists. Please choose another one.");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Error during registration");
    }
});

app.listen(3000, () => {
    console.log("server is running on port 3000");
});
