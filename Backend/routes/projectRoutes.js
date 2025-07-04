// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project'); // Import the Project model
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import auth middleware
const User = require('../models/User'); // To populate owner/members

// @route   GET /api/projects
// @desc    Get all projects (or projects for a specific user if query param is provided)
// @access  Private (Authenticated users can see projects)
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        // If a userId query parameter is provided, filter projects by owner
        if (req.query.userId) {
            query.owner = req.query.userId;
        } else if (req.user.role === 'student' || req.user.role === 'parent') {
            // Students and parents should only see their own projects by default
            query.owner = req.user.id;
        }

        const projects = await Project.find(query)
                                    .populate('owner', 'username email') // Populate owner with username and email
                                    .populate('members', 'username role'); // Populate members

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error.message);
        res.status(500).json({ message: 'Server error fetching projects.' });
    }
});

// @route   GET /api/projects/:id
// @desc    Get a single project by ID
// @access  Private (Authenticated users can view specific projects)
router.get('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
                                    .populate('owner', 'username email')
                                    .populate('members', 'username role');

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Basic authorization: Only owner, members, or admin/teacher can view
        const isOwner = project.owner._id.toString() === req.user.id.toString();
        const isMember = project.members.some(member => member._id.toString() === req.user.id.toString());
        const isAdminOrTeacher = ['admin', 'teacher'].includes(req.user.role);

        if (!isOwner && !isMember && !isAdminOrTeacher) {
            return res.status(403).json({ message: 'Not authorized to view this project.' });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project by ID:', error.message);
        res.status(500).json({ message: 'Server error fetching project.' });
    }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Students can create projects, teachers/admins too)
router.post('/', protect, authorizeRoles('student', 'teacher', 'admin'), async (req, res) => {
    const { title, description, status, dueDate, startDate, endDate, technologies, githubLink, liveLink, members } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Project title and description are required.' });
    }

    try {
        const newProject = new Project({
            title,
            description,
            owner: req.user.id, // Set the logged-in user as the owner
            status: status || 'pending',
            dueDate,
            startDate,
            endDate,
            technologies,
            githubLink,
            liveLink,
            members: members || [], // Allow adding members during creation
        });

        const savedProject = await newProject.save();
        // Populate owner and members before sending response
        await savedProject.populate('owner', 'username email');
        await savedProject.populate('members', 'username role');

        res.status(201).json({ message: 'Project created successfully.', project: savedProject });
    } catch (error) {
        console.error('Error creating project:', error.message);
        res.status(500).json({ message: 'Server error creating project.' });
    }
});

// @route   PUT /api/projects/:id
// @desc    Update a project by ID
// @access  Private (Owner, members, or admin/teacher)
router.put('/:id', protect, async (req, res) => {
    const { title, description, status, dueDate, startDate, endDate, technologies, githubLink, liveLink, members } = req.body;

    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Authorization: Only owner, members, or admin/teacher can update
        const isOwner = project.owner.toString() === req.user.id.toString();
        const isMember = project.members.some(member => member.toString() === req.user.id.toString());
        const isAdminOrTeacher = ['admin', 'teacher'].includes(req.user.role);

        if (!isOwner && !isMember && !isAdminOrTeacher) {
            return res.status(403).json({ message: 'Not authorized to update this project.' });
        }

        // Update fields
        project.title = title || project.title;
        project.description = description || project.description;
        project.status = status || project.status;
        project.dueDate = dueDate || project.dueDate;
        project.startDate = startDate || project.startDate;
        project.endDate = endDate || project.endDate;
        project.technologies = technologies || project.technologies;
        project.githubLink = githubLink || project.githubLink;
        project.liveLink = liveLink || project.liveLink;
        project.members = members || project.members;

        const updatedProject = await project.save();
        await updatedProject.populate('owner', 'username email');
        await updatedProject.populate('members', 'username role');

        res.status(200).json({ message: 'Project updated successfully.', project: updatedProject });
    } catch (error) {
        console.error('Error updating project:', error.message);
        res.status(500).json({ message: 'Server error updating project.' });
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project by ID
// @access  Private (Owner or Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Authorization: Only owner or admin can delete
        const isOwner = project.owner.toString() === req.user.id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this project.' });
        }

        await project.deleteOne(); // Use deleteOne() or findByIdAndDelete()
        res.status(200).json({ message: 'Project deleted successfully.' });
    } catch (error) {
        console.error('Error deleting project:', error.message);
        res.status(500).json({ message: 'Server error deleting project.' });
    }
});

module.exports = router;
