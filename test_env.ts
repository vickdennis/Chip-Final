console.log("Checking environment variables in shell_exec...");
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
  console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY.length);
  console.log("GEMINI_API_KEY starts with:", process.env.GEMINI_API_KEY.substring(0, 5));
}
