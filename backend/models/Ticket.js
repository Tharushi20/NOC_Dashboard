import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  bankName: { type: String },
  ticketId: { type: String, required: true, unique: true },
  issueDescription: { type: String },
  status: {
    type: String,
    required: true,
    enum: ['Assigned', 'In Progress', 'Closed', 'Resolved'],
    default: 'Assigned'
  },
  assignedTechnician: { type: String, required: true },
  requester: { type: String },
  subject: { type: String },
  createdDate: { type: Date }, // Original created date/time from form
  dueDate: { type: Date },
  resolvedDate: { type: Date },
  sla: { type: String },
  fitOperator: { type: String },
  dateCreated: { type: Date, default: Date.now } // System-recorded created date
});

// Keep existing logic: if createdDate is provided, mirror it into dateCreated
// Use the promise-based middleware style (no `next` callback) to avoid
// "next is not a function" errors in newer Mongoose versions.
ticketSchema.pre('save', function () {
  if (this.createdDate) {
    this.dateCreated = this.createdDate;
  } else if (!this.dateCreated) {
    this.dateCreated = new Date();
  }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;