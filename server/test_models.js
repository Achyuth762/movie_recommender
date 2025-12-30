const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function list() {
    try {
        // For GoogleGenerativeAI SDK, we can't directly list models easily via the high level helper in v0.1.
        // But we can try to hit the endpoint or just try a standard request.
        // Actually, the SDK does NOT have a listModels method exposed on the main instance in some versions.
        // Let's try to just run a simple generation with a known safe model to test the KEY itself.

        console.log("Testing API Key with 'gemini-1.5-flash'...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success! Response:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);

        try {
            console.log("Testing API Key with 'gemini-pro'...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Hello");
            console.log("Success! Response:", result2.response.text());
        } catch (err2) {
            console.error("Error with gemini-pro:", err2.message);
        }
    }
}

list();
