import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    img: { type: String, default: "" },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    googleSignIn: { type: Boolean, required: true, default: false },
    projects: { type: [mongoose.Schema.Types.ObjectId], ref: "Project", default: [] },
    teams: { type: [mongoose.Schema.Types.ObjectId], ref: "Teams", default: [] },
    notifications: { type: [mongoose.Schema.Types.ObjectId], ref: "Notifications", default: [] },
    works: { type: [mongoose.Schema.Types.ObjectId], ref: "Works", default: [] },
    tasks: { type: [mongoose.Schema.Types.ObjectId], ref: "Tasks", default: [] },
    organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Organization" }],
    currentOrganization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" }
}, { timestamps: true });

mongoose.connect(process.env.MONGO_URL).then(async () => {
    console.log("✅ Connected to MongoDB");

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    const SALT_ROUNDS = 10;

    const users = [
        {
            name: "Alice Manager",
            email: "alice@test.com",
            password: "Test@1234",
            gender: "Female",
            img: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
            googleSignIn: false,
        },
        {
            name: "Bob Developer",
            email: "bob@test.com",
            password: "Test@1234",
            gender: "Male",
            img: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
            googleSignIn: false,
        }
    ];

    for (const userData of users) {
        // Check if user already exists
        const existing = await User.findOne({ email: userData.email });
        if (existing) {
            console.log(`⚠️  User already exists: ${userData.email} — skipping`);
            continue;
        }

        const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
        const user = new User({
            ...userData,
            password: hashedPassword,
        });
        await user.save();
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }

    console.log("\n========================================");
    console.log("🧪 TEST USER CREDENTIALS");
    console.log("========================================");
    console.log("👤 User 1 — Project Manager");
    console.log("   Email   : alice@test.com");
    console.log("   Password: Test@1234");
    console.log("----------------------------------------");
    console.log("👤 User 2 — Developer");
    console.log("   Email   : bob@test.com");
    console.log("   Password: Test@1234");
    console.log("========================================\n");

    process.exit(0);
}).catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
