const Child = require('../models/Child');
const User = require('../models/User');
const Module = require('../models/Module');
const { calculateLevel } = require('../utils/gamificationUtils');

exports.createChild = async (req, res) => {
    try {
        const { name, dob, avatar, learningPreferences, gradeLevel } = req.body;
        const userId = req.user.id;
        const child = await Child.create({
            userId,
            name,
            dob,
            avatar,
            learningPreferences,
            gradeLevel,
        });
        res.status(201).json({
            success: true,
            data: child
        });
    } catch (error) {
        console.error('Error creating child:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getChildren = async (req, res) => {
    try {
        const userId = req.user.id;
        const children = await Child.find({ userId }).select('-__v');
        res.status(200).json({
            success: true,
            count: children.length,
            data: children
        });
    } catch (error) {
        console.error('Error fetching children:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching children'
        });
    }
};

exports.getChildById = async (req, res) => {
    try {
        const childId = req.params.id;
        const userId = req.user.id;
        const child = await Child.findOne({ _id: childId, userId });
        if (!child) {
            return res.status(404).json({
                success: false,
                message: 'Child not found or you do not have access to this child.'
            });
        }
        res.status(200).json({
            success: true,
            data: child
        });
    } catch (error) {
        console.error('Error fetching child by ID:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid Child ID format.' });
        }
        res.status(500).json({
            success: false,
            message: 'Server error fetching child'
        });
    }
};

exports.updateChild = async (req, res) => {
    try {
        const childId = req.params.id;
        const userId = req.user.id;
        const { name, dob, avatar, learningPreferences, gradeLevel } = req.body;
        const child = await Child.findOneAndUpdate(
            { _id: childId, userId },
            { name, dob, avatar, learningPreferences, gradeLevel, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        if (!child) {
            return res.status(404).json({
                success: false,
                message: 'Child not found or you do not have access to update this child.'
            });
        }
        res.status(200).json({
            success: true,
            data: child
        });
    } catch (error) {
        console.error('Error updating child:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid Child ID format.' });
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteChild = async (req, res) => {
    try {
        const childId = req.params.id;
        const userId = req.user.id;
        const child = await Child.findOneAndDelete({ _id: childId, userId });
        if (!child) {
            return res.status(404).json({
                success: false,
                message: 'Child not found or you do not have access to delete this child.'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Child profile deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting child:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid Child ID format.' });
        }
        res.status(500).json({
            success: false,
            message: 'Server error deleting child'
        });
    }
};

exports.updateChildProgress = async (req, res) => {
    try {
        const childId = req.params.id;
        const userId = req.user.id;
        const { moduleId, xpGain } = req.body;
        const child = await Child.findOne({ _id: childId, userId });
        if (!child) {
            return res.status(404).json({
                success: false,
                message: 'Child not found or you do not have access.'
            });
        }
        let gamification = { xpGain: 0, levelUp: false, newLevel: child.level };
        if (xpGain && xpGain > 0) {
            child.currentXp = (child.currentXp || 0) + xpGain;
            gamification.xpGain = xpGain;
            const newLevel = calculateLevel(child.currentXp);
            if (newLevel > child.level) {
                child.level = newLevel;
                gamification.levelUp = true;
                gamification.newLevel = newLevel;
            }
        }
        if (moduleId && !child.modulesCompleted.includes(moduleId)) {
            child.modulesCompleted.push(moduleId);
        }
        child.lastActiveAt = new Date();
        await child.save();
        res.status(200).json({
            success: true,
            message: 'Child progress updated successfully!',
            data: child,
            gamification
        });
    } catch (error) {
        console.error('Error updating child progress:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid ID format.' });
        }
        res.status(500).json({
            success: false,
            message: 'Server error updating child progress.'
        });
    }
};
