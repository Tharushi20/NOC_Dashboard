// Updated Problem.js (backend model)
import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subCategory: { type: String },
  subSubCategory: { type: String },
  description: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  escalatedPerson: { type: String },
  fitOperator: { type: String },
  plannedUnplanned: { type: String },
  remarks: { type: String },
  image: { type: String }, // Store image URL or path
  details: { type: String }
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;