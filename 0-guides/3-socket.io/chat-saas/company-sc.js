import mongoose from "mongoose";

const companySC = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, "Company name is required."],
    trim: true,
    minlength: [2, "Company name must be at least 2 characters."],
    maxlength: [100, "Company name cannot exceed 100 characters."]
  },
  apiKey: {
    type: String,
    required: [true, "API Key is required."],
    unique: true,
    index: true,
    trim: true,
    lowercase: true
  },
  origin: {
    type: [{ type: String, trim: true, lowercase: true }],
    default: [],
    required: [true, "At least one allowed domain (Origin) is required."]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model("companies", companySC);