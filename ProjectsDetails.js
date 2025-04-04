const mongoose = require("mongoose");

const ProjectDetailSchema = new mongoose.Schema({
    project_Id: String,
    project_description: String,
    long_project_description: String,
    created_by: String,
    project_start_date: String,
    project_end_date: String,
    contractor_phone: String,
    completion_percentage: Number,
    status: String,
    reason_on_hold: String,
    contractor_id: String, // this fields in for DB
    contractor_name: String,
    worker_id: String, // this fields in for DB
    worker_name: String,
    images: { type: [String], default: [] },
    project_status: String,
    rejection_reason: String,


}, { collation: { locale: 'en', strength: 2 } }); // Ensure collation is an object

mongoose.model("ProjectInfo", ProjectDetailSchema);
