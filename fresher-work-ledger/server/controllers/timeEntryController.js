import TimeEntry from '../models/TimeEntry.js';
import Task from '../models/Task.js';
import mongoose from 'mongoose';

// @desc    Get all time entries
// @route   GET /api/time
// @access  Private
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

    if (req.user.role === 'user') {
      filter.userId = req.user._id;
    } else if (req.user.role === 'client') {
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
// @route   POST /api/time/start
// @access  Private
export const startTimer = async (req, res) => {
  try {
    const { taskId, projectId, isBillable, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid Task or Project selection.' });
    }

    // Check if user already has an active timer
    const activeEntry = await TimeEntry.findOne({ userId: req.user._id, isActive: true });
    if (activeEntry) {
      return res.status(400).json({ message: 'You already have an active timer running' });
    }

    const newEntry = await TimeEntry.create({
      taskId,
      projectId,
      userId: req.user._id,
      isBillable,
      startTime: new Date(),
      description,
      isActive: true
    });

    res.status(201).json(newEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Stop timer
// @route   PUT /api/time/stop/:id
// @access  Private
export const stopTimer = async (req, res) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Time entry not found' });

    if (entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!entry.isActive) {
      return res.status(400).json({ message: 'Timer is already stopped' });
    }

    const start = new Date(entry.startTime);
    const end = new Date();
    
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Stored session start time is invalid.' });
    }

    entry.endTime = end;
    entry.durationSeconds = Math.max(0, Math.floor((end - start) / 1000));
    entry.isActive = false;

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add manual manual time entry
// @route   POST /api/time/manual
// @access  Private
export const addManualTime = async (req, res) => {
  try {
    const { taskId, projectId, isBillable, startTime, endTime, durationHours, description } = req.body;

    let sTime = startTime ? new Date(startTime) : new Date();
    let eTime = endTime ? new Date(endTime) : null;
    let durationSeconds = 0;

    if (durationHours) {
      durationSeconds = Math.floor(parseFloat(durationHours) * 3600);
      if (!endTime) {
        eTime = new Date(sTime.getTime() + durationSeconds * 1000);
      }
    } else if (sTime && eTime) {
      durationSeconds = Math.floor((eTime - sTime) / 1000);
    }

    const newEntry = await TimeEntry.create({
      taskId,
      projectId,
      userId: req.user._id,
      isBillable,
      startTime: sTime,
      endTime: eTime,
      durationSeconds,
      description,
      isActive: false
    });

    res.status(201).json(newEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// @desc    Update time entry
// @route   PUT /api/time/:id
// @access  Private
export const updateTimeEntry = async (req, res) => {
  try {
    const { startTime, endTime, description, isBillable, projectId, taskId } = req.body;
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Time entry not found' });

    if (entry.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (startTime && endTime) {
      entry.startTime = new Date(startTime);
      entry.endTime = new Date(endTime);
      entry.durationSeconds = Math.max(0, Math.floor((entry.endTime - entry.startTime) / 1000));
    }
    
    if (description !== undefined) entry.description = description;
    if (isBillable !== undefined) entry.isBillable = isBillable;
    if (projectId) entry.projectId = projectId;
    if (taskId) entry.taskId = taskId;

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete time entry
// @route   DELETE /api/time/:id
// @access  Private
export const deleteTimeEntry = async (req, res) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Time entry not found' });

    if (entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await TimeEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Time entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get project-wise time aggregate (Analytics)
// @route   GET /api/time/analytics/project-wise
// @access  Private
export const getProjectWiseTime = async (req, res) => {
  try {
    const aggregate = await TimeEntry.aggregate([
      { $match: { isActive: false } },
      {
        $group: {
          _id: '$projectId',
          totalDurationSeconds: { $sum: '$durationSeconds' }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $project: {
          projectId: '$_id',
          projectName: '$project.name',
          totalHours: { $divide: ['$totalDurationSeconds', 3600] },
          totalSeconds: '$totalDurationSeconds'
        }
      },
      { $sort: { totalSeconds: -1 } }
    ]);
    res.json(aggregate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
