import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

// Define the user schema
const UserSchema = new Schema({
  username: { type: String, required: true, min: 4, unique: true },

  password: { type: String, required: true, min: 4 },
});

// Pre-save hook to hash the password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
