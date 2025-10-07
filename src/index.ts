import { initApp } from "./app";
import { connectToDatabase } from "./db";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToDatabase();
    const app = await initApp();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
}

startServer();
