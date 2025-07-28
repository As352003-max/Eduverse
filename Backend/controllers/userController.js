const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Project = require('../models/Project');

const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    res.json({ message: 'Profile updated successfully', user: updatedUser });
});

const getUserProgress = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    if (req.user._id.toString() !== userId && !['teacher', 'parent', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized to view this user\'s progress.' });
    }

    const dummyProgress = { userId, completedModules: 5, totalQuizzes: 10, score: 85, lastActivity: new Date() };
    res.status(200).json(dummyProgress);
});

const getUserProjects = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const projects = await Project.find({ owner: userId }).populate('owner', 'username email');
    if (!projects.length) return res.status(404).json({ message: 'No projects found.' });
    res.status(200).json(projects);
});

const getAssociatedStudents = asyncHandler(async (req, res) => {
    let students = [];
    if (req.user.role === 'teacher') students = [{ _id: 's1', username: 'Student A' }];
    else if (req.user.role === 'parent') students = [{ _id: 's3', username: 'Child C' }];
    else if (req.user.role === 'admin') students = await User.find({ role: 'student' }).select('-password');

    if (!students.length) return res.status(404).json({ message: 'No students found.' });
    res.status(200).json(students);
});

module.exports = {
    getCurrentUserProfile,
    updateCurrentUserProfile,
    getUserProgress,
    getUserProjects,
    getAssociatedStudents,
};
