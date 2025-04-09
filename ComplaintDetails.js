const mongoose = require("mongoose");

const ComplaintDetailSchema = new mongoose.Schema({
    project_Id: String,
    complaint_Id: String,
    subject: String,
    complaint_Description: String,
    project_Description: String,
    long_Project_Description: String,
    project_Start_Date: String,
    complaint_Date: String,
    phone: String,

}, { collation: { locale: 'en', strength: 2 } });

mongoose.model("ComplaintInfo", ComplaintDetailSchema);
