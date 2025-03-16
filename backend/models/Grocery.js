// models/studentModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const grocerySchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // triggers duplicate error if the same email is used again
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
        unique: true // "all address must be unique"
    },
    age: {
        type: Number,
        required: true,
        min: 18 // "Age more than 18"
    },
    marks: {
        Biology: { type: Number, default: 0 },
        Chemistry: { type: Number, default: 0 },
        Physics: { type: Number, default: 0 },
        Computer: { type: Number, default: 0 },
        Geography: { type: Number, default: 0 },
        History: { type: Number, default: 0 },
        Science: { type: Number, default: 0 },
        English: { type: Number, default: 0 },
        Mathematics: { type: Number, default: 0 }
    },
    profilePicture: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);
export default Student;
