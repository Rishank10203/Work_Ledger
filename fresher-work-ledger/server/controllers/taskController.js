import Task from '../models/Task.js';
import mongoose from 'mongoose';

// @desc    Get all tasks with aggregation
export const getTasks = async (req, res) => {
  try {
    const projectId = req.query.projectId || req.query.project_id || req.query.project;
    if (!projectId) return res.json([]);

    let matchFilter = { projectId: new mongoose.Types.ObjectId(projectId) };
    const role = req.user.role?.toLowerCase();

    if (role === 'user' || role === 'team member') {
      matchFilter.assignedUser = req.user._id;
    } else if (role === 'client') {
      const project = await mongoose.model('Project').findById(projectId);
      if (!project || project.clientId?.toString() !== req.user.clientId?.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const tasks = await Task.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'subtasks',
          localField: '_id',
          foreignField: 'taskId',
          as: 'subTasks'
        }
      },
      {
        $addFields: {
          subTaskCount: { $size: '$subTasks' },
          completedSubTasks: {
            $size: {
              $filter: {
                input: '$subTasks',
                as: 'st',
                cond: { $eq: ['$$st.isCompleted', true] }
              }
            }
          }
        }
      },
      { $project: { subTasks: 0 } },
      { $sort: { order: 1, createdAt: -1 } }
    ]);

    const populatedTasks = await Task.populate(tasks, [
      { path: 'projectId' },
      { path: 'assignedUser', select: 'name email' }
    ]);

    res.json(populatedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks by project (Simple)
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ projectId: new mongoose.Types.ObjectId(projectId) })
      .populate('assignedUser', 'name email')
      .populate('projectId', 'name')
      .sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
export const createTask = async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can create tasks.' });
    }
    const task = await Task.create(req.body);
    const populated = await task.populate([
      { path: 'projectId', select: 'name' },
      { path: 'assignedUser', select: 'name email' }
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const role = req.user.role?.toLowerCase();
    if (role !== 'admin') {
      const allowedKeys = ['status', 'order'];
      const isOnlyStatus = Object.keys(req.body).every(key => allowedKeys.includes(key));
      if (!isOnlyStatus) {
        return res.status(403).json({ message: 'Authorization Failure: Only Admin can edit task parameters.' });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('projectId', 'name')
      .populate('assignedUser', 'name email');
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a task
export const deleteTask = async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Operational Block: Only Admin can delete tasks.' });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
