import TimeEntry from '../models/TimeEntry.js';
import Task from '../models/Task.js';

// @desc    Get all time entries
export const getTimeEntries = async (req, res) => {
  try {
    const { projectId, taskId, userId, startDate, endDate } = req.query;
    let filter = {};

    if (projectId) filter.projectId = projectId;
    if (taskId) filter.taskId = taskId;
    if (userId) filter.userId = userId;

    if (startDate && endDate) {
      filter.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const role = req.user.role?.toLowerCase();
    if (role === 'user' || role === 'team member') {
      filter.userId = req.user._id;
    } else if (role === 'client') {
      filter.isBillable = true;
      if (!projectId) return res.status(400).json({ message: 'Client must provide projectId' });
    }

    const entries = await TimeEntry.find(filter)
      .populate('taskId', 'title')
      .populate('projectId', 'name')
      .populate('userId', 'name');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start timer
export const startTimer = async (req, res) => {
  try {
    const { taskId, projectId, isBillable, description } = req.body;
    const activeEntry = await TimeEntry.findOne({ userId: req.user._id, isActive: true });
    if (activeEntry) return res.status(400).json({ message: 'You already have an active timer running' });

    const newEntry = await TimeEntry.create({
      taskId, projectId, userId: req.user._id, isBillable, startTime: new Date(), description, isActive: true
    });
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Stop timer
export const stopTimer = async (req, res) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Time entry not found' });
    if (entry.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const end = new Date();
    entry.endTime = end;
    entry.durationSeconds = Math.max(0, Math.floor((end - new Date(entry.startTime)) / 1000));
    entry.isActive = false;

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add manual time entry
export const addManualTime = async (req, res) => {
  try {
    const { taskId, projectId, isBillable, startTime, durationHours, description } = req.body;
    let sTime = new Date(startTime);
    let durSec = Math.floor(parseFloat(durationHours || 0) * 3600);
    let eTime = new Date(sTime.getTime() + durSec * 1000);

    const newEntry = await TimeEntry.create({
      taskId, projectId, userId: req.user._id, isBillable, startTime: sTime, endTime: eTime, durationSeconds: durSec, description, isActive: false
    });
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update time entry
export const updateTimeEntry = async (req, res) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Time entry not found' });
    if (entry.userId.toString() !== req.user._id.toString() && req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(entry, req.body);
    if (req.body.startTime && req.body.endTime) {
      entry.durationSeconds = Math.max(0, Math.floor((new Date(req.body.endTime) - new Date(req.body.startTime)) / 1000));
    }

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete time entry
export const deleteTimeEntry = async (req, res) => {
  try {
    await TimeEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Time entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics
export const getProjectWiseTime = async (req, res) => {
  try {
    const aggregate = await TimeEntry.aggregate([
      { $match: { isActive: false } },
      { $group: { _id: '$projectId', totalDurationSeconds: { $sum: '$durationSeconds' } } },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: '$project' },
      { $project: { projectName: '$project.name', totalHours: { $divide: ['$totalDurationSeconds', 3600] } } }
    ]);
    res.json(aggregate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
