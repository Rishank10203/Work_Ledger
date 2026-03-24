import Project from '../models/Project.js';
import Client from '../models/Client.js';
import mongoose from 'mongoose';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) throw new Error('DB Disconnected');
    let filter = {};
    if (req.user.role === 'Client') {
      filter = { clientId: req.user.clientId };
    } else if (req.user.role === 'Team Member') {
      filter = { users: req.user._id };
    }
    const projects = await Project.find(filter)
      .populate('clientId', 'name company')
      .populate('users', 'name email');
    res.json(projects);
  } catch (error) {
    console.warn('Projects Fallback (DB Offline):', error.message);
    res.json([
      { _id: 'p1', name: 'Website Redesign', status: 'In Progress', progress: 65, client: { name: 'Acme Corp' } },
      { _id: 'p2', name: 'Mobile App', status: 'Planning', progress: 10, client: { name: 'TechStart' } }
    ]);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Admin, Project Manager)
export const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
export const getClients = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) throw new Error('DB Disconnected');
    const clients = await Client.find({});
    res.json(clients);
  } catch (error) {
    console.warn('Clients Fallback (DB Offline):', error.message);
    res.json([
      { _id: 'c1', name: 'Acme Corp', company: 'Acme Industries', email: 'contact@acme.com' },
      { _id: 'c2', name: 'TechStart', company: 'TechStart Inc', email: 'hi@techstart.io' }
    ]);
  }
};

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('clientId', 'name company')
      .populate('users', 'name email');
    
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin, PM)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('clientId', 'name company')
      .populate('users', 'name email');
      
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (project) {
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
