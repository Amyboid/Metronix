import { PUBLIC_DB_URI } from "$env/static/public";
import { connect } from 'mongoose';

type connectionObj = {
    isConnected?: number
}

if (!PUBLIC_DB_URI) {
    throw new Error('please define PUBLIC_DB_URI inside .env*');
}
const connection: connectionObj = {};
let c = 0;
const connectToDatabase = async () => {
    if (connection.isConnected) {
        console.error('Already connected...');
        return
    }
    try {
        let connectionInstance = await connect(PUBLIC_DB_URI);
        console.log('Database connected successfully', connectionInstance.connection.host);
        
        connection.isConnected = connectionInstance.connections[0].readyState 
    } catch (error) {
        console.log("error connecting database", error);
    }
}

export default connectToDatabase;