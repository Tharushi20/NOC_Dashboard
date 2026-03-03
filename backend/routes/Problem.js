// problems.js
import express from 'express';
import Joi from 'joi';
import Problem from '../models/Problem.js';

const router = express.Router();

// Validation schema
const problemSchema = Joi.object({
  category: Joi.string().required(),
  subCategory: Joi.string().allow(''),
  subSubCategory: Joi.string().allow(''),
  description: Joi.string().required(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  escalatedPerson: Joi.string().optional(),
  fitOperator: Joi.string().optional(),
  plannedUnplanned: Joi.string().valid('Planned', 'Unplanned').required(),
  remarks: Joi.string().optional(),
  image: Joi.any().optional(), // Handle file upload
  details: Joi.string().optional()
});

// GET all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().sort({ startTime: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// NEW: GET dashboard data (latest problem and total count)
router.get('/dashboard', async (req, res) => {
  try {
    const totalProblems = await Problem.countDocuments();
    const latestProblem = await Problem.findOne().sort({ startTime: -1 });
    res.json({
      totalProblems,
      latestProblem: latestProblem || null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single problem
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new problem
router.post('/', async (req, res) => {
  const { error } = problemSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const newProblem = new Problem(req.body);
    if (req.file) newProblem.image = req.file.path; // Assuming multer or similar middleware
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update problem
router.put('/:id', async (req, res) => {
  const { error } = problemSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const updatedProblem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProblem) return res.status(404).json({ message: 'Problem not found' });
    res.json(updatedProblem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE problem
router.delete('/:id', async (req, res) => {
  try {
    const deletedProblem = await Problem.findByIdAndDelete(req.params.id);
    if (!deletedProblem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;