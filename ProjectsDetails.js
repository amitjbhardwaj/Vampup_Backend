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
    assign_to: String,
    reason_on_hold: String,
}, { collation: { locale: 'en', strength: 2 } }); // Ensure collation is an object

mongoose.model("ProjectInfo", ProjectDetailSchema);
