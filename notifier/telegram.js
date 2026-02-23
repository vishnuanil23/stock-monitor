import axios from "axios";

export async function sendNotification(message) {
  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    console.error("Missing BOT_TOKEN or CHAT_ID; cannot send Telegram message.");
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message
    });

    if (response?.data?.ok) {
      console.log("Telegram message sent successfully.");
      return true;
    }

    console.error("Telegram API responded with failure:", response?.data);
    return false;
  } catch (error) {
    console.error("Failed to send Telegram message:", error.message || error);
    return false;
  }
}
