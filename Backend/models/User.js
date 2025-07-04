const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    // IMPORTANT FIX: Password is required only if authType is 'email_password'
    password: {
        type: String,
        required: function() {
            return this.authType === 'email_password';
        },
        minlength: 6
    },
    firebaseId: { type: String, unique: true, sparse: true }, // New field for Firebase UID
    authType: {
        type: String,
        enum: ['email_password', 'firebase'],
        default: 'email_password' // Default to email/password auth
    },
    role: { type: String, enum: ['student', 'teacher', 'parent', 'admin'], default: 'student' },
    grade: { type: Number, min: 5, max: 10 }, // For students
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For students to link to parents
    totalXp: { type: Number, default: 0 },
    badges: [{ type: String }], // Array of badge names or IDs
    currentLevel: { type: Number, default: 1 }, // Added currentLevel
    lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before saving (only for email_password users)
userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.authType === 'email_password') {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare entered password with hashed password (for traditional login)
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) { // If user has no password (e.g., Firebase user)
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
