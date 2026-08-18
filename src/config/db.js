import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { DATABASE_URL } from "./env.js";

const connectionString = `${DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

export async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log("[Database] : Connected to the database successfully.");
    } catch (error) {
        console.error("[Database] : Failed to connect to the database.", error);
        process.exit(1); // Exit the process with an error code
    }
}