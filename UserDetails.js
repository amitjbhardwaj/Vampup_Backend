const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    role: String,
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    aadhar: String,
    accountHolder: String,
    accountNumber: String,
    ifsc: String,
    branch: String,
    mobile: String,
    contractor_id: String, // this fields in for DB
    contractor_name: String,
    admin_id: String, // this fields in for DB
    admin_name: String,
}, { collation: { locale: 'en', strength: 2 } }); // Ensure collation is an object

mongoose.model("UserInfo", UserSchema);
