import axios from "axios";

const LOG_API = "http://20.244.56.144/evaluation-service/logs";

// Replace this with the token they gave you (if required)
const AUTH_TOKEN = "Bearer your_token_here";

export async function Log(stack, level, pkg, message) {
  try {
    const payload = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      package: pkg.toLowerCase(),
      message,
    };

    const res = await axios.post(LOG_API, payload, {
      headers: {
        Authorization: AUTH_TOKEN,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (e) {
    console.error("Log error:", e.response?.data || e.message);
  }
}
