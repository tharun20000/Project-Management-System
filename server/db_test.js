import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
    const db = mongoose.connection.db;
    const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).limit(3).toArray();
    fs.writeFileSync('test_output.json', JSON.stringify(tasks, null, 2));
    process.exit(0);
}).catch(console.error);
