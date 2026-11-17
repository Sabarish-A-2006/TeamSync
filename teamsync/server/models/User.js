const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    profileImage: { type: String, default: '' },
    designation: { type: String, default: '', trim: true },
    department: { type: String, default: '', trim: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    isAvailable: { type: Boolean, default: false },
    availabilityStatus: { type: String, enum: ['available', 'unavailable', 'away'], default: 'unavailable' },
    statusMessage: { type: String, default: '', trim: true },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
    },
    timezone: { type: String, default: 'UTC' },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', function (next) {
  if (this.isModified('availabilityStatus')) {
    if (this.availabilityStatus === 'available') this.isAvailable = true;
    else this.isAvailable = false;
  } else if (this.isModified('isAvailable')) {
    this.availabilityStatus = this.isAvailable ? 'available' : 'unavailable';
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ teamId: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('User', userSchema);
