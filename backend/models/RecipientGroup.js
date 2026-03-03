import mongoose from 'mongoose';

const recipientGroupSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  error_description: { type: String },
  machine_location: { type: String }
});

const RecipientGroup = mongoose.model('RecipientGroup', recipientGroupSchema);

export default RecipientGroup;