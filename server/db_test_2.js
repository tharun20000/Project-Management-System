import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
    const db = mongoose.connection.db;
    const task = await db.collection("tasks").find({ task: "wefwfe" }).toArray();
    fs.writeFileSync('test_output_custom.json', JSON.stringify(task, null, 2));
    process.exit(0);
}).catch(console.error);
