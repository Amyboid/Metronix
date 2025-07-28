import bcrypt from 'bcrypt';
import connectToDatabase from './connectDatabase';
import User from '$lib/models/UserModel';
import Session from '$lib/models/SessionModel';
import mongoose from 'mongoose';

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function findUserByUsername(username: string) {
    await connectToDatabase();
    const user = await User.findOne({ username })

    if (user) {
        return {
            id: user._id.toString(),
            username: user.username,
            passwordHash: user.password,
            role: user.role
        }
    }

    return null;
}

export async function createSession(userId: string, userRole: string) {
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000 * 7)

    await Session.create(
        {
            sessionId,
            userId: new mongoose.Types.ObjectId(userId),
            userRole,
            expiresAt,
        }
    );

    return sessionId;
}

export async function verifySession(sessionId: string) {
    await connectToDatabase();
    const session = await Session.findOne({ sessionId }).populate('userId');

    if (!session || session.expiresAt < new Date()) {
        if (session && session.expiresAt < new Date()) {
            await invalidateSession(sessionId);
        }
        return null;
    }

    const userDoc = session.userId as any;

    if (userDoc) {
        return {
            id: userDoc._id.toString(),
            username: userDoc.username,
            role: userDoc.role
        };
    }
    return null;
}

export async function invalidateSession(sessionId: string) {
    await connectToDatabase(); // Ensure DB connection before query
    await Session.deleteOne({ sessionId });
}


export async function createInitialAdminUser(username: string, passwordPlain: string, role: string) {
    const existingUser = await User.findOne({ username });
    console.log(existingUser);

    if (existingUser) {
        console.warn(`User "${username}" already exists.`);
        return existingUser;
    }

    const hashedPassword = await hashPassword(passwordPlain);
    const newUser = await User.create(
        {
            username,
            password: hashedPassword,
            role
        }
    )
    console.log(`Admin user "${username}" created successfully.`);
    return newUser;
}