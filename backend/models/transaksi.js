import mongoose from "mongoose";

const transaksiSchema = new mongoose.Schema(
{
    clientName:{
        type:String,
        required:true
    },
    serviceName:{
        type:String,
        required:true
    },
    freelancer:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:"Proses"
    },
    notes:{
        type:String,
        default:""
    }
},
{
    timestamps:true
});

export default mongoose.model("Transaksi", transaksiSchema);