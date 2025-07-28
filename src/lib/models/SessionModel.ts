import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const sessionSchema = new Schema({
    sessionId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userRole: { type: String, required: true },
    expiresAt: { type: Date, required: true },
},
    { timestamps: true }
);

const Session = models.Session || model('Session', sessionSchema)

export default Session;