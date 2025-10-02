import { initApp } from "./app";

const PORT = process.env.PORT || 3000;

initApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
  });
