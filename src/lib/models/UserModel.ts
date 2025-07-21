import type { password } from 'bun';
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
 

const userSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true }
    }
)

const User = models.User || model('User', userSchema)

export default User;