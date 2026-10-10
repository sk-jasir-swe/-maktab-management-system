const app = require("./src/app");
const ConnectDB = require("./src/config/db");

const PORT = process.env.PORT || 5001;

async function startServer() {
    try {
        await ConnectDB();

        app.listen(PORT, () => {
            console.log(`Your server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();