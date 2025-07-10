const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    createChild,
    getChildren,
    getChildById,
    updateChild,
    deleteChild,
    updateChildProgress
} = require('../controllers/childController');

const router = express.Router();

router.route('/')
    .post(protect, createChild)
    .get(protect, getChildren);

router.route('/:id')
    .get(protect, getChildById)
    .put(protect, updateChild)
    .delete(protect, deleteChild);

router.route('/:id/progress').post(protect, updateChildProgress);

module.exports = router;
