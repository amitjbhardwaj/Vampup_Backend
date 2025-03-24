const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    role: String,
    report_to: String,
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
}, { collation: { locale: 'en', strength: 2 } }); // Ensure collation is an object

mongoose.model("UserInfo", UserSchema);
