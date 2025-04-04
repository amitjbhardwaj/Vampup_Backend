const mongoose = require("mongoose");

const PaymentDetailSchema = new mongoose.Schema({
    project_Id: String,
    amount_allocated: Number,
    new_amount_allocated: Number,
    paid_amount_to_contractor: Number,
    paid_amount_to_worker: Number,
    pending_amount_to_contractor: Number,
    pending_amount_to_worker: Number,
    paid_via:String,
    payment_date:String,

}, { collation: { locale: 'en', strength: 2 } });

mongoose.model("PaymentInfo", PaymentDetailSchema);
