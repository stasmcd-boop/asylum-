const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8765560708:AAE3XW-ra8zd5wuMR9XDoN1clqy2SXMkfj0';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7798853644';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const message = String(body.message || '').trim();

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'Message is required' })
      };
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          ok: false,
          error: result?.description || 'Telegram request failed'
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message || 'Server error' })
    };
  }
};
