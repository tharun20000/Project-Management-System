import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
    const db = mongoose.connection.db;
    const work = await db.collection("works").find({ title: "wefwfe" }).toArray();
    fs.writeFileSync('test_output_works.json', JSON.stringify(work, null, 2));
    process.exit(0);
}).catch(console.error);
