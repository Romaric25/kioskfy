import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/db/schema";

// Create the MySQL connection
const connectionString = process.env.DATABASE_URL!;

// Create the mysql client
const client = mysql.createPool(connectionString);

// Create and export the Drizzle database instance
export const db = drizzle(client, { schema, mode: "default" });
