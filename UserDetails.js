const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema(
  {
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
  },
  {
    collection: "UserInfo",
  }
);
mongoose.model("UserInfo", UserDetailSchema);