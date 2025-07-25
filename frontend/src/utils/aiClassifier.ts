export const classifyWithAI = async (
  hint: string,
  options: string[]
): Promise<string> => {
  try {
    const response = await fetch("http://localhost:5000/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hint, options }),
    });

    const data = await response.json();
    return data.guess || "Unknown";
  } catch (error) {
    console.error("AI classification error:", error);
    return "Unknown";
  }
};
