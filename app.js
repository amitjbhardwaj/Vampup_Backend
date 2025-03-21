const express = require('express');
const app = express();
const mongoose = require('mongoose');
app.use(express.json())
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mongoUrl = "mongodb+srv://amitjbhardwaj:admin@cluster0.mcxgr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


const JWT_SECRET = "skldfjdsflk()dkfljfkf[]sklmf345klmkvdfmvklksdgj40pop64iktelrgel";
mongoose.connect(mongoUrl).then(() => {
    console.log("Database connected");
}).catch((e) => {
    console.log(e);
})


require("./UserDetails")

const User = mongoose.model("UserInfo")
app.get("/", (req, res) => {
    res.send({ status: "Started" })
})

app.post("/register", async (req, res) => {
    //array destructing 
    const { role, firstName, lastName, email, password, aadhar, accountHolder, accountNumber, ifsc, branch, mobile } = req.body;

    const oldUser = await User.findOne({ email: email }).collation({ locale: "en", strength: 2 })

    if (oldUser) {
        return res.send("User already exists !!!")
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    try {
        await User.create({
            role: role,
            firstName: firstName,
            lastName,
            email,
            password: encryptedPassword,
            aadhar,
            accountHolder,
            accountNumber,
            ifsc,
            branch,
            mobile,
        })
        res.send({ status: "OK", data: "User created" })
    } catch (error) {
        res.send({ status: "error", data: error })
    }
})

app.post("/login-user", async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const oldUser = await User.findOne({ email: email });
    if (!oldUser) {
        return res.status(400).json({ error: "User doesn't exist!" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, oldUser.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token with user role included
    const token = jwt.sign(
        { email: oldUser.email, role: oldUser.role }, // Include role in JWT
        process.env.JWT_SECRET || "your_secret_key",
        { expiresIn: "1h" }
    );

    return res.status(200).json({ status: "OK", token, role: oldUser.role });
});


app.post("/userdata", async (req, res) => {
    const { token } = req.body;

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        const userEmail = user.email;

        // Find user by email in the database
        const userData = await User.findOne({ email: userEmail });

        if (!userData) {
            return res.status(404).json({ status: "error", data: "User not found" });
        }

        return res.status(200).json({ status: "OK", data: userData });
    } catch (error) {
        return res.status(401).json({ status: "error", data: "Invalid token" });
    }
});

app.get("/get-all-user", async (req, res) => {
    try {
      const data = await User.find({});
      res.send({ status: "OK", data: data });
    } catch (error) {
      return res.send({ error: error });
    }
  });



require("./ProjectsDetails")
const Project = mongoose.model("ProjectInfo")

app.post("/create-project", async (req, res) => {
    //array destructing 
    const { project_Id, project_description, long_project_description, created_by, project_start_date, project_end_date, contractor_phone, completion_percentage, status } = req.body;

    const oldProject = await Project.findOne({ project_Id: project_Id }).collation({ locale: "en", strength: 2 })

    if (oldProject) {
        return res.send("Project already exists !!!")
    }

    // Format dates to yyyy-mm-dd (remove time)
    const formattedStartDate = new Date(project_start_date).toISOString().split('T')[0];
    const formattedEndDate = new Date(project_end_date).toISOString().split('T')[0];


    try {
        await Project.create({
            project_Id: project_Id,
            project_description: project_description,
            long_project_description,
            created_by,
            project_start_date: formattedStartDate,
            project_end_date: formattedEndDate,
            contractor_phone,
            completion_percentage,
            status,
        })
        res.send({ status: "OK", data: "Project created" })
    } catch (error) {
        res.send({ status: "error", data: error })
    }
})


app.get("/get-all-projects", async (req, res) => {
    try {
      const data = await Project.find({});
      res.send({ status: "OK", data: data });
    } catch (error) {
      return res.send({ error: error });
    }
  });

app.listen(5001, () => {
    console.log('Node js server has been started!!!')
})