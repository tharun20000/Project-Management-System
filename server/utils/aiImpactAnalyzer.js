// This utility simulates an AI analyzing a task's title and description to predict its impact on the codebase.
// In a full production environment, this could ping the OpenAI/Gemini API.

export const analyzeTaskImpact = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();

    let risk = "Low";
    const modules = new Set();
    let notes = [];

    // --- High Risk Keywords & Core Systems ---
    if (text.match(/auth|login|signup|password|jwt|token|security|oauth/i)) {
        risk = "High";
        modules.add("Authentication");
        notes.push("Changes to the authentication flow carry high security risks. Ensure all test coverage passes.");
    }

    if (text.match(/database|schema|migration|mongoose|sql|mongo|query/i)) {
        risk = "High";
        modules.add("Database Models");
        notes.push("Database schema changes can break existing data or API contracts. Verify backward compatibility.");
    }

    if (text.match(/payment|stripe|checkout|billing|subscription/i)) {
        risk = "High";
        modules.add("Billing System");
        notes.push("Billing changes affect revenue processing. Require secondary code review.");
    }

    // --- Medium Risk Keywords & Logic ---
    if (text.match(/api|route|controller|endpoint|fetch|axios/i)) {
        if (risk !== "High") risk = "Medium";
        modules.add("API Layer");
        notes.push("API modifications might affect frontend clients. Coordinate with the UI team.");
    }

    if (text.match(/state|redux|context|store|dispatch/i)) {
        if (risk !== "High") risk = "Medium";
        modules.add("Global State");
        notes.push("Modifying global state management can trigger unintended re-renders across multiple components.");
    }

    if (text.match(/socket|realtime|websocket|io|sync/i)) {
        if (risk !== "High") risk = "Medium";
        modules.add("WebSocket / Realtime");
        notes.push("Realtime sync changes require multi-user verification to prevent memory leaks or split-brain states.");
    }

    // --- Low Risk Keywords & UI ---
    if (text.match(/ui|css|color|pixel|padding|margin|font|layout|button|hover/i)) {
        modules.add("UI / Styling");
        notes.push("Visual changes should be verified on both mobile and desktop views.");
    }

    if (text.match(/copy|text|typo|translation|i18n|wording/i)) {
        modules.add("Localization / Copy");
        notes.push("Content updates are low risk.");
    }

    // Fallbacks
    if (modules.size === 0) {
        modules.add("General Component");
        notes.push("No specific critical modules detected by keyword analysis.");
    }

    return {
        impact_risk: risk,
        impact_modules: Array.from(modules),
        impact_notes: notes.join(" ")
    };
};
