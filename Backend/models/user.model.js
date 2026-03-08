import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
  type: String,
  enum: ["admin", "manager", "sales"],
  default: "sales"
},
isApproved: {
    type: Boolean,
    default: false 
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }

}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
