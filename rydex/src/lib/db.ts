import mongoose from "mongoose";
import { logger } from "./logger";

const mongodbUrl = process.env.MONGODB_URI;

if (!mongodbUrl) {
    throw new Error("MONGODB_URI not found!");
}

let cached = global.mongooseConn;

if (!cached) {
    cached = global.mongooseConn = {
        conn: null,
        promise: null,
    };
}

const connectDb = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        logger.info({
            action: "DATABASE_CONNECTING",
        });

        cached.promise = mongoose
        .connect(mongodbUrl)
        .then((mongooseInstance) => {
            logger.info({
            action: "DATABASE_CONNECTED",
            database: mongooseInstance.connection.name,
            });

            return mongooseInstance.connection;
        });
    }

    try {
        const conn = await cached.promise;
        cached.conn = conn;

        return conn;
    } catch (error) {
        logger.error({
        action: "DATABASE_CONNECTION_FAILED",
        message:
            error instanceof Error
            ? error.message
            : "Unknown error",
        });

        cached.promise = null;

        throw error;
    }
};

export default connectDb;