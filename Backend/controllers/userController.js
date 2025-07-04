// backend/controllers/userController.js
const asyncHandler = require('express-async-handler'); // Good practice for async route handlers
const User = require('../models/User'); // Assuming your User model is here
const Project = require('../models/Project'); // Assuming your Project model is here
// You might need other models like GameProgress, etc.

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUserProfile = asyncHandler(async (req, res) => {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            totalXp: user.totalXp,
            currentLevel: user.currentLevel,
            // Add other user fields as needed
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        // Only update password if it's provided
        if (req.body.password) {
            user.password = req.body.password;
        }
        // You can add other updatable fields like role (with proper authorization)

        const updatedUser = await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                totalXp: updatedUser.totalXp,
                currentLevel: updatedUser.currentLevel
            }
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Get a user's game progress
// @route   GET /api/users/:id/progress
// @access  Private (Self, Parent, Teacher, Admin)
const getUserProgress = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    // Implement logic to fetch game progress for userId
    // You might need to check if req.user._id matches userId or if req.user has the right role
    if (req.user._id.toString() !== userId && !['teacher', 'parent', 'admin'].includes(req.user.role)) {
         return res.status(403).json({ message: 'Not authorized to view this user\'s progress.' });
    }

    // Dummy data for now - replace with actual database query
    const dummyProgress = {
        userId: userId,
        completedModules: 5,
        totalQuizzes: 10,
        score: 85,
        lastActivity: new Date()
    };
    res.status(200).json(dummyProgress);
});

// @desc    Get a user's projects (public if published)
// @route   GET /api/users/:id/projects
// @access  Public (or Private depending on project visibility)
const getUserProjects = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    // Logic to fetch projects associated with userId
    // Projects might have a 'isPublic' or 'owner' field
    const projects = await Project.find({ owner: userId }).populate('owner', 'username email');
    
    // You might add logic here to filter for public projects if the route is truly public
    // e.g., filter only where project.isPublic === true for non-owner requests

    if (projects.length > 0) {
        res.status(200).json(projects);
    } else {
        res.status(404).json({ message: 'No projects found for this user.' });
    }
});

// @desc    Teacher/Admin/Parent specific: Get all students associated with them
// @route   GET /api/users/students
// @access  Private (Teacher, Parent, Admin)
const getAssociatedStudents = asyncHandler(async (req, res) => {
    // Implement logic to find students associated with req.user based on their role
    let students = [];
    if (req.user.role === 'teacher') {
        // Find students assigned to this teacher (requires a 'teacher' field in User model for students)
        // students = await User.find({ role: 'student', teacherId: req.user._id });
        students = [{ _id: 's1', username: 'Student A' }, { _id: 's2', username: 'Student B' }]; // Dummy
    } else if (req.user.role === 'parent') {
        // Find children of this parent (requires a 'parentId' field in User model for students)
        // students = await User.find({ role: 'student', parentId: req.user._id });
        students = [{ _id: 's3', username: 'Child C' }]; // Dummy
    } else if (req.user.role === 'admin') {
        // Admin can see all students
        students = await User.find({ role: 'student' }).select('-password');
    }

    if (students.length > 0) {
        res.status(200).json(students);
    } else {
        res.status(404).json({ message: 'No associated students found.' });
    }
});


module.exports = {
    getCurrentUserProfile,
    updateCurrentUserProfile,
    getUserProgress,
    getUserProjects,
    getAssociatedStudents,
};