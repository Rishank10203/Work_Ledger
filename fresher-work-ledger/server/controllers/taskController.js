import Task from '../models/Task.js';
import SubTask from '../models/SubTask.js';
import mongoose from 'mongoose';

// @desc    Get tasks by project (Step 2 Implementation)
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log("[getTasksByProject] Incoming projectId:", projectId);

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID format' });
    }

    const tasks = await Task.find({ projectId: new mongoose.Types.ObjectId(projectId) })
      .populate('assignedUser', 'name email')
      .populate('projectId', 'name')
      .sort({ order: 1, createdAt: -1 });

    console.log(`[getTasksByProject] Found ${tasks.length} tasks for project ${projectId}`);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("[getTasksByProject] Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) throw new Error('DB Disconnected');
    const projectId = req.query.projectId || req.query.project_id || req.query.project;
    
    // Step 5: Debug Check
    console.log("All tasks in DB:", await Task.find().limit(5));

    if (!projectId) {
      return res.json([]);
    }

    let matchFilter = { 
      projectId: new mongoose.Types.ObjectId(projectId)
    };

    const role = req.user.role?.toLowerCase();

    if (role === 'user' || role === 'team member') {
      matchFilter.assignedUser = req.user._id;
    } else if (role === 'client') {
      // Security: Ensure the project belongs to the client
      const project = await mongoose.model('Project').findById(projectId);
      if (!project || project.clientId?.toString() !== req.user.clientId?.toString()) {
        return res.status(403).json({ message: 'Access denied: This project does not belong to your organization' });
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
    console.warn('Tasks Aggregation Fail:', error.message);
    res.json([]);
  }
};

export const createTask = async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can create tasks.' });
    }
    const { title, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and Project are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID format' });
    }

    const taskData = {
      title,
      projectId,
      description: req.body.description || '',
      status: req.body.status || 'todo',
      priority: req.body.priority || 'Medium',
      assignedUser: req.body.assignedUser || null,
      estimatedHours: req.body.estimatedHours || 1,
      isBillable: req.body.isBillable !== undefined ? req.body.isBillable : true,
      deadline: req.body.deadline || null,
    };
    
    const task = await Task.create(taskData);
    const populated = await task.populate([
      { path: 'projectId', select: 'name' },
      { path: 'assignedUser', select: 'name email' }
    ]);
    console.log('[createTask] Task created:', task._id);
    res.status(201).json(populated);
  } catch (error) {
    console.error('[createTask] Error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // RBAC: Non-admins can only toggle status and reorder tasks via drag-drop
    const role = req.user.role?.toLowerCase();
    if (role !== 'admin') {
      const allowedKeys = ['status', 'order'];
      const requestedKeys = Object.keys(req.body);
      const isOnlyStatus = requestedKeys.every(key => allowedKeys.includes(key));
      
      if (!isOnlyStatus) {
        return res.status(403).json({ message: 'Authorization Failure: Only Admin can edit task parameters.' });
      }
      
      if (role === 'user' || role === 'team member' && task.assignedUser?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Security Breach: Not authorized to update this task.' });
      }
    }

    if (req.body.project && !req.body.projectId) {
      req.body.projectId = req.body.project;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('projectId', 'name')
      .populate('assignedUser', 'name email');
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Operational Block: Only Admin can delete tasks.' });
    }
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) {
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

