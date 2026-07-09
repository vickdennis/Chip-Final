const fs = require('fs');
let file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'app.use(express.json());',
  'app.use(express.json({ limit: "50mb" }));'
);

// Add global error handler before the Vite middleware setup
const target = 'if (process.env.NODE_ENV !== "production") {';
const globalError = `
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Express Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  });

`;
content = content.replace(target, globalError + target);

fs.writeFileSync(file, content);
