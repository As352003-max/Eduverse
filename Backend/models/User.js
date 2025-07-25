const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: {
        type: String,
        required: function() {
            return this.authType === 'email_password';
        },
        minlength: 6,
        select: false
    },
    firebaseId: {
        type: String,
        unique: true,
        sparse: true
    },
    authType: {
        type: String,
        enum: ['email_password', 'firebase'],
        default: 'email_password',
        required: true
    },
    role: { type: String, enum: ['student', 'teacher', 'parent', 'admin'], default: 'student' },
    grade: { type: Number, min: 5, max: 10 },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalXp: { type: Number, default: 0 },
    badges: [{ type: String }], // For specific badge achievements
    currentLevel: { type: Number, default: 1 },
    lastLogin: { type: Date, default: Date.now },
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.authType === 'email_password') {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);