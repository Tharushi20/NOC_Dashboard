import mongoose from 'mongoose';
import { getCriticalAlertConnection } from '../db/criticalAlertConnection.js';

export const recipientGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  to: { type: String, required: true },
  cc: { type: String }
});

const conn = getCriticalAlertConnection();
// If Critical Alert DB isn't configured, fall back to default mongoose connection
// so the server can still boot. Routes will guard and return 503.
const modelSource = conn || mongoose;
const RecipientGroup = modelSource.models?.RecipientGroup || modelSource.model('RecipientGroup', recipientGroupSchema);

export default RecipientGroup;