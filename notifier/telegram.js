import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function sendNotification(message) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.CHAT_ID,
        text: message
      }
    );
    console.log("✅ Telegram notification sent");
  } catch (err) {
    console.error("❌ Telegram error:", err.message);
  }
}
