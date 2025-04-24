const express = require('express');
const app = express();
const mongoose = require('mongoose');
app.use(express.json())
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");

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
    const { role, firstName, lastName, email, password, aadhar, accountHolder, accountNumber, ifsc, branch, mobile, contractor_id, contractor_name, admin_id, admin_name, passcode } = req.body;

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
            contractor_id,
            contractor_name,
            admin_id,
            admin_name,
            passcode,
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

    return res.status(200).json({
        status: "OK",
        token,
        role: oldUser.role,
        firstName: oldUser.firstName,
        lastName: oldUser.lastName,
    });
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

app.post("/check-aadhar", async (req, res) => {
    try {
        const { aadhar } = req.body;
        const user = await User.findOne({ aadhar });

        if (!user) {
            return res.status(404).json({ message: "Aadhaar not found" });
        }

        res.status(200).json({ message: "Aadhaar exists", user });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

app.get("/get-passcode/:aadhar", async (req, res) => {
    const { aadhar } = req.params;

    try {
        if (!/^\d{12}$/.test(aadhar)) {
            return res.status(400).json({ error: "Invalid Aadhaar format" });
        }

        const user = await User.findOne({ aadhar });

        if (!user) {
            return res.status(404).json({ error: "User not found with provided Aadhaar" });
        }

        return res.status(200).json({ passcode: user.passcode || null });
    } catch (error) {
        console.error("Error fetching passcode:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/verify-passcode", async (req, res) => {
    const { aadhar, passcode } = req.body;

    try {
        const user = await User.findOne({ aadhar });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare passcode
        if (user.passcode !== passcode) {
            return res.status(401).json({ error: "Invalid passcode" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: user.email, role: user.role },
            process.env.JWT_SECRET || "your_secret_key",
            { expiresIn: "1h" }
        );

        // Respond with user info and token
        return res.status(200).json({
            status: "OK",
            token,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        });

    } catch (error) {
        console.error("Error verifying passcode:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


require("./ProjectsDetails")
const Project = mongoose.model("ProjectInfo")

app.post("/create-project", async (req, res) => {
    //array destructing 
    const { project_Id, project_description, long_project_description, created_by, project_start_date, project_end_date, mobile, contractor_phone, completion_percentage, status, contractor_id, contractor_name, worker_id, worker_name, worker_phone } = req.body;

    const oldProject = await Project.findOne({ project_Id: project_Id }).collation({ locale: "en", strength: 2 })

    if (oldProject) {
        return res.send("Project already exists !!!")
    }

    // Format dates to yyyy-mm-dd (remove time)
    const formattedStartDate = new Date(project_start_date).toISOString().split('T')[0];
    //const formattedEndDate = new Date(project_end_date).toISOString().split('T')[0];


    try {
        await Project.create({
            project_Id: project_Id,
            project_description: project_description,
            long_project_description,
            created_by,
            project_start_date: formattedStartDate,
            project_end_date,
            mobile,
            contractor_phone,
            completion_percentage,
            status,
            contractor_id,
            contractor_name,
            worker_id,
            worker_name,
            worker_phone,
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

app.get("/get-completed-projects", async (req, res) => {
    try {
        const { workerName } = req.query;

        if (!workerName) {
            return res.status(400).json({ error: "Worker name is required" });
        }

        const completedProjects = await Project.find({
            worker_name: { $regex: new RegExp(`^${workerName}$`, "i") }, // Case insensitive match
            completion_percentage: { $gte: 100 },
        });

        res.json({ status: "OK", data: completedProjects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Error fetching completed projects", details: error.message });
    }
});

app.get("/get-projects-by-admin", async (req, res) => {
    const { created_by, status } = req.query; // Get `created_by` and `status` values from query parameters

    if (!created_by) {
        return res.status(400).send({ error: "created_by parameter is required" });
    }

    try {
        // Build the query object dynamically based on provided parameters
        const query = { created_by: created_by };

        // If a status is provided, add it to the query object
        if (status) {
            query.status = status.trim();
        }

        // Find projects that match the query criteria
        const projects = await Project.find(query);

        // If no projects are found, return a message
        if (projects.length === 0) {
            return res.status(404).send({ message: "No projects found for this user" });
        }

        // Send back the projects if found
        res.send({ status: "OK", data: projects });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

app.get("/get-projects-by-contractor", async (req, res) => {
    const { contractor_name, status } = req.query; // Get `contractor_name` and `status` values from query parameters

    if (!contractor_name) {
        return res.status(400).send({ error: "contractor_name parameter is required" });
    }

    try {
        // Build the query object dynamically based on provided parameters
        const query = { contractor_name: contractor_name };

        // If a status is provided, add it to the query object
        if (status) {
            query.status = status.trim();
        }

        // Find projects that match the query criteria
        const projects = await Project.find(query);

        // If no projects are found, return a message
        if (projects.length === 0) {
            return res.status(404).send({ message: "No projects found for this user" });
        }

        // Send back the projects if found
        res.send({ status: "OK", data: projects });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

app.get("/get-projects-by-worker", async (req, res) => {
    const { worker_name, status } = req.query; // Get `worker_name` and `status` values from query parameters

    if (!worker_name) {
        return res.status(400).send({ error: "worker_name parameter is required" });
    }

    try {
        // Build the query object dynamically based on provided parameters
        const query = { worker_name: worker_name };

        // If a status is provided, add it to the query object
        if (status) {
            query.status = status.trim();
        }

        // Find projects that match the query criteria
        const projects = await Project.find(query);

        // If no projects are found, return a message
        if (projects.length === 0) {
            return res.status(404).send({ message: "No projects found for this user" });
        }

        // Send back the projects if found
        res.send({ status: "OK", data: projects });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

app.delete("/delete-project/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await Project.deleteOne({ _id: id });
        res.status(200).send({ status: "OK", data: "Project Deleted" });
    } catch (error) {
        res.status(500).send({ status: "ERROR", error: error.message });
    }
});

app.put("/update-project/:projectId", async (req, res) => {
    const { projectId } = req.params; // Correcting param usage
    const { contractor_name, contractor_phone } = req.body; // Expecting contractor's name

    try {
        const updatedProject = await Project.findByIdAndUpdate(
            projectId, // Correct ID usage
            { contractor_name, contractor_phone }, // Store contractor's name properly
            { new: true, upsert: true } // Ensure new field is added
        );

        if (!updatedProject) {
            return res.status(404).json({ status: "ERROR", message: "Project not found" });
        }

        res.json({ status: "OK", message: "Project assigned", data: updatedProject });
    } catch (error) {
        console.error("Update project error:", error);
        res.status(500).json({ status: "ERROR", message: "Server error" });
    }
});

app.put("/update-project-status/:projectId", async (req, res) => {
    const { projectId } = req.params;
    const { project_status, completion_percentage } = req.body;

    try {
        // Build the update object dynamically
        const updateFields = { project_status };
        if (completion_percentage !== undefined) {
            updateFields.completion_percentage = completion_percentage;
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            updateFields,
            { new: true } // return the updated document
        );

        if (!updatedProject) {
            return res.status(404).json({ status: "ERROR", message: "Project not found" });
        }

        res.json({ status: "OK", message: "Project updated successfully", data: updatedProject });
    } catch (error) {
        console.error("Update project error:", error);
        res.status(500).json({ status: "ERROR", message: "Server error" });
    }
});

app.put("/update-project-completion/:projectId", async (req, res) => {
    const { projectId } = req.params;
    const { completion_percentage, status } = req.body;

    if (completion_percentage < 0 || completion_percentage > 100) {
        return res.status(400).json({ status: "ERROR", message: "Completion percentage must be between 0 and 100." });
    }

    try {
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            {
                completion_percentage,
                status
            },
            { new: true, upsert: false } // Ensure it updates an existing document only
        );

        if (!updatedProject) {
            return res.status(404).json({ status: "ERROR", message: "Project not found" });
        }

        res.json({ status: "OK", message: "Completion percentage updated successfully", data: updatedProject });
    } catch (error) {
        console.error("Update project completion error:", error);
        res.status(500).json({ status: "ERROR", message: "Server error" });
    }
});

app.put("/update-project-on-hold/:projectId", async (req, res) => {
    const { projectId } = req.params; // Correct ID usage
    const { status, project_end_date, reason_on_hold } = req.body;
    const updateFields = { status, reason_on_hold };

    // Validate input
    if (!status || !project_end_date || !reason_on_hold) {
        return res.status(400).json({ status: "ERROR", message: "Status and End Date are required" });
    }

    if (status !== "On-Hold") {
        updateFields.project_end_date = project_end_date;
    }


    try {
        // Find and update the project with new status and end date
        const updatedProject = await Project.findByIdAndUpdate(
            projectId, // Correct ID usage
            {
                status, // Update the status field
                project_end_date, // Update the end date field
                reason_on_hold, //Update reason for on-hold
            },
            { new: true, upsert: true } // Ensure new field is added
        );

        if (!updatedProject) {
            return res.status(404).json({ status: "ERROR", message: "Project not found" });
        }

        res.json({ status: "OK", message: "Project put on-hold", data: updatedProject });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ status: "ERROR", message: "Server error" });
    }
});

app.put("/update-project-active/:projectId", async (req, res) => {
    const { projectId } = req.params; // Correct ID usage
    const { status, project_end_date, reason_on_hold } = req.body; // Expecting new status and end date in the request body

    // Validate input
    if (!status || !project_end_date) {
        return res.status(400).json({ status: "ERROR", message: "Status and End Date are required" });
    }

    try {
        // Find and update the project with new status and end date
        const updatedProject = await Project.findByIdAndUpdate(
            projectId, // Correct ID usage
            {
                status, // Update the status field
                project_end_date, // Update the end date field
                reason_on_hold, //Update reason for on-hold
            },
            { new: true } // Ensure the updated project is returned
        );

        if (!updatedProject) {
            return res.status(404).json({ status: "ERROR", message: "Project not found" });
        }

        res.json({ status: "OK", message: "Project activated", data: updatedProject });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ status: "ERROR", message: "Server error" });
    }
});

app.put("/update-worker-name", async (req, res) => {
    // Destructure request body
    let { worker_name, contractor_name, project_description, worker_phone } = req.body;

    // Trim any leading/trailing spaces from the inputs
    worker_name = worker_name.trim();
    worker_phone = worker_phone,
        contractor_name = contractor_name.trim();
    project_description = project_description.trim();

    // Check for missing fields
    if (!worker_name || !contractor_name || !project_description) {
        return res.status(400).json({ status: "ERROR", message: "Missing required fields" });
    }

    try {
        // Find the project by project_description and contractor_name and update it
        const updatedProject = await Project.findOneAndUpdate(
            { project_description: project_description, contractor_name: contractor_name },
            {
                $set: {
                    worker_name: worker_name,
                    worker_phone: worker_phone
                }
            },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ status: "ERROR", message: "Project not found for the given contractor" });
        }

        res.json({ status: "OK", message: "Worker name updated successfully", data: updatedProject });
    } catch (error) {
        console.error("Error updating worker name in project:", error);
        res.status(500).json({ status: "ERROR", message: "Server error" });
    }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Configure Multer to handle image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Store files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp as filename
    }
});

const upload = multer({ storage });

// Endpoint to upload images
app.post("/upload-images", upload.array('images'), async (req, res) => {
    const { project_Id } = req.body;
    const uploadedImages = req.files;

    if (!project_Id || uploadedImages.length === 0) {
        return res.status(400).json({ status: "ERROR", message: "Project ID and images are required." });
    }

    try {
        const project = await Project.findOne({ project_Id });

        if (!project) {
            return res.status(404).json({ status: "ERROR", message: "Project not found." });
        }

        const imagePaths = uploadedImages.map(file => `/uploads/${file.filename}`);
        project.images = [...project.images, ...imagePaths];

        await project.save();

        res.status(200).json({ status: "OK", message: "Images uploaded successfully.", data: project });
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ status: "ERROR", message: "Could not upload images." });
    }
});

// Endpoint to delete an image
app.post("/delete-image", async (req, res) => {
    const { project_Id, image_url } = req.body;

    if (!project_Id || !image_url) {
        return res.status(400).json({ status: "ERROR", message: "Project ID and image URL are required." });
    }

    try {
        const project = await Project.findOne({ project_Id });

        if (!project) {
            return res.status(404).json({ status: "ERROR", message: "Project not found." });
        }

        // Remove the image from the project
        project.images = project.images.filter(image => image !== image_url);
        await project.save();

        res.status(200).json({ status: "OK", message: "Image deleted successfully." });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ status: "ERROR", message: "Could not delete image." });
    }
});


require("./PaymentDetails")
const Payment = mongoose.model("PaymentInfo")

// Route to allocate initial amount
app.post("/allocate-amount", async (req, res) => {
    const { project_Id, amount_allocated } = req.body;
    try {
        await Payment.create({
            project_Id: project_Id,
            amount_allocated,
            new_amount_allocated: amount_allocated
        })
        res.send({ status: "OK", data: "Amount allocated" })
    } catch (error) {
        res.send({ status: "error", data: error })
    }
});

app.put("/update-allocated-amount", async (req, res) => {
    try {
        const { project_Id } = req.query;
        const { new_amount_allocated } = req.body;

        if (!project_Id || new_amount_allocated === undefined) {
            return res.status(400).json({ error: "project_Id and new fund are required" });
        }

        const updatedPayment = await Payment.findOneAndUpdate(
            { project_Id },
            { $set: { new_amount_allocated: new_amount_allocated } },
            { new: true }
        );

        if (!updatedPayment) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.status(200).json({ message: "Fund updated successfully", data: updatedPayment });
    } catch (error) {
        console.error("Error updating allocated amount:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.get("/get-allocated-funds-by-admin", async (req, res) => {
    try {
        const { created_by } = req.query;

        if (!created_by) {
            return res.status(400).json({ error: "created_by is required" });
        }

        const projects = await Project.find({ created_by });
        const projectIds = projects.map(p => p.project_Id);

        const payments = await Payment.find({ project_Id: { $in: projectIds } });

        const fundMap = {};
        payments.forEach(payment => {
            fundMap[payment.project_Id] = {
                amount_allocated: payment.amount_allocated,
                new_amount_allocated: payment.new_amount_allocated,
            };
        });

        return res.status(200).json({ status: "OK", data: fundMap });
    } catch (error) {
        console.error("Error fetching funds:", error);
        res.status(500).json({ status: "FAILED", error: error.message });
    }
});

app.get("/get-fund-history", async (req, res) => {
    const { project_Id } = req.query;
    try {
        const result = await Payment.findOne({ project_Id });
        if (result) {
            res.json({ status: "OK", data: result.allocations });
        } else {
            res.json({ status: "NO_HISTORY", data: [] });
        }
    } catch (error) {
        res.status(500).json({ status: "ERROR", message: error.message });
    }
});

// Assuming you're using the Payment model

app.get("/get-fund-by-project", async (req, res) => {
    const { project_Id } = req.query;

    if (!project_Id) {
        return res.status(400).json({ error: "Project ID is required" });
    }

    try {
        const fund = await Payment.findOne({ project_Id });

        if (!fund) {
            return res.status(404).json({ error: "No fund found for this project" });
        }

        res.json({ status: "OK", data: fund });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server error", details: error.message });
    }
});

require("./ComplaintDetails")
const Complaint = mongoose.model("ComplaintInfo")

app.post("/create-complaint", async (req, res) => {

    const { project_Id, complaint_Id, subject, complaint_Description, project_Description, long_Project_Description, project_Start_Date, complaint_Date, created_by, phone } = req.body;

    try {
        await Complaint.create({
            project_Id,
            complaint_Id,
            subject,
            complaint_Description,
            project_Description,
            long_Project_Description,
            project_Start_Date,
            complaint_Date,
            created_by,
            phone
        })
        res.send({ status: "OK", data: "Complaint created" })
    } catch (error) {
        res.send({ status: "error", data: error })
    }
})

// GET complaints for a specific worker by name
app.get("/get-complaints-by-worker/:workerName", async (req, res) => {
    const { workerName } = req.params;  // Use workerName here instead of created_by

    try {
        const complaints = await Complaint.find({ created_by: workerName });
        res.json({ status: "OK", data: complaints });
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ status: "FAILED", message: "Error fetching complaints" });
    }
});

// PUT endpoint to update complaint by project_Id
app.put("/update-complaint/:project_Id", async (req, res) => {
    const { project_Id } = req.params;
    const { subject, complaint_Description } = req.body;

    try {
        const updatedComplaint = await Complaint.findOneAndUpdate(
            { project_Id },
            { subject, complaint_Description },
            { new: true } // Return the updated document
        );

        if (!updatedComplaint) {
            return res.status(404).send({ status: "error", data: "Complaint not found" });
        }

        res.send({ status: "OK", data: updatedComplaint });
    } catch (error) {
        console.error("Error updating complaint:", error);
        res.status(500).send({ status: "error", data: error });
    }
});

app.delete("/delete-complaint/:complaint_Id", async (req, res) => {
    const complaint_Id = req.params.complaint_Id;

    try {
        const result = await Complaint.deleteOne({ complaint_Id });

        if (result.deletedCount === 1) {
            res.json({ status: "OK", message: "Complaint deleted successfully" });
        } else {
            res.status(404).json({ status: "FAILED", message: "Complaint not found" });
        }
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ status: "FAILED", message: "Server error during delete" });
    }
});

app.listen(5001, () => {
    console.log('Node js server has been started!!!')
})