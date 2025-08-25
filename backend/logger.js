import axios from "axios";

const LOG_API = "http://20.244.56.144/evaluation-service/logs";

// paste the access_token you got from auth API here
const AUTH_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhc3NoMjJjc0BjbXJpdC5hYy5pbiIsImV4cCI6MTc1NjA5ODg3MSwiaWF0IjoxNzU2MDk3OTcxLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNob2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJjODViZDc4YS0xN2ZlLTRhOGItYmFjOS1lNWI0ZTZiZGQ0NWMiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJhc2h1dG9zaCBzaHVrbGEiLCJzdWIiOiIyNGFkYmU2YS0wMjEyLTRhODgtYjllMC00MWEzMTMzODcwNjAifSwiZW1haWwiOiJhc3NoMjJjc0BjbXJpdC5hYy5pbiIsIm5hbWUiOiJhc2h1dG9zaCBzaHVrbGEiLCJyb2xsTm8iOiIxb3IyMmNzMDM2IiwiYWNjZXNzQ29kZSI6InlVVlFYSyIsImNsaWVudElEIjoiMjRhZGJlNmEtMDIxMi00YTg4LWI5ZTAtNDFhMzEzMzg3MDYwIiwiY2xpZW50U2VjcmV0IjoiY3pWaFFRR1ZZcmplcGZIZiJ9.H0I9WsRZxn5lOc0S6SIdHmm_0DjgtMzuDUksdH9RpWg";

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
