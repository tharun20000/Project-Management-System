import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
    const db = mongoose.connection.db;

    // Simulate the exact problem by looking at the most recently created works
    // and seeing if its 'tasks' array is populated correctly.

    // This is strictly a database side query to see if Mongoose populates works
    const WorksSchema = new mongoose.Schema({
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Projects" },
        creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        title: String,
        desc: String,
        tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tasks" }]
    }, { timestamps: true });

    const TasksSchema = new mongoose.Schema({
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Projects" },
        workId: { type: mongoose.Schema.Types.ObjectId, ref: "Works" },
        task: String,
        desc: String
    });

    // Check if models are already registered
    const Works = mongoose.models.Works || mongoose.model("Works", WorksSchema);
    const Tasks = mongoose.models.Tasks || mongoose.model("Tasks", TasksSchema);

    const latestWorks = await Works.find().sort({ createdAt: -1 }).limit(2).populate("tasks").lean().exec();

    require('fs').writeFileSync('test_populate.json', JSON.stringify(latestWorks, null, 2));
    process.exit(0);
}).catch(console.error);
