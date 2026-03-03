import express from 'express';
import Ticket from '../models/Ticket.js';

const router = express.Router();

// 1. Add a new ticket (POST)
router.post('/', async (req, res) => {
  try {
    const ticketData = { ...req.body };

    // sanitize empty date strings
    if (ticketData.createdDate === '') delete ticketData.createdDate;
    if (ticketData.dueDate === '') delete ticketData.dueDate;
    if (ticketData.resolvedDate === '') delete ticketData.resolvedDate;

    // Safety check: "Open" -> "Assigned"
    if (ticketData.status === 'Open') ticketData.status = 'Assigned';

    // *** පරණ දින ඇතුළත් කිරීමේ නිවැරදි කිරීම ***
    // ඔබ Form එකෙන් එවන 'createdDate' අගය database එකේ 'dateCreated' ලෙස සේව් කිරීම
    if (ticketData.createdDate) {
      ticketData.dateCreated = new Date(ticketData.createdDate);
    }

    const newTicket = new Ticket(ticketData);
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    if (err.name === 'MongoServerError' && err.code === 11000) {
      const dupField = Object.keys(err.keyValue || {}).join(', ');
      return res.status(409).json({ message: `${dupField || 'Field'} already exists` });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join('; ');
      return res.status(400).json({ message: messages || err.message });
    }
    res.status(400).json({ message: err.message });
  }
});

// 2. Get all tickets
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.hasCreated === 'true') {
      filter.dateCreated = { $exists: true, $ne: null };
    }
    const tickets = await Ticket.find(filter).sort({ dateCreated: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Get tickets by bank
router.get('/bank/:bankName', async (req, res) => {
  try {
    const filter = { bankName: req.params.bankName };
    const tickets = await Ticket.find(filter).sort({ dateCreated: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Get daily tickets (Simplified to all)
router.get('/daily-open', async (req, res) => {
  try {
    const tickets = await Ticket.find({}).sort({ dateCreated: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Get ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Update a ticket (PUT)
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    // sanitize empty date strings
    if (updateData.createdDate === '') delete updateData.createdDate;
    if (updateData.dueDate === '') delete updateData.dueDate;
    if (updateData.resolvedDate === '') delete updateData.resolvedDate;

    // Safety check: "Open" -> "Assigned"
    if (updateData.status === 'Open') updateData.status = 'Assigned';

    // *** පරණ දින Update කිරීමේ නිවැරදි කිරීම ***
    if (updateData.createdDate) {
      updateData.dateCreated = new Date(updateData.createdDate);
    }

    const updated = await Ticket.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Ticket not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 7. Delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;