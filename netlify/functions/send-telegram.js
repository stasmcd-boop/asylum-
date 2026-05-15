const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const allowedOrigins = new Set([
  'https://easy-asylum.com',
  'https://easy-asylum.com'
]);

function buildHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://easy-asylum.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: buildHeaders(event.headers.origin || event.headers.Origin),
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...buildHeaders(event.headers.origin || event.headers.Origin), Allow: 'POST' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' })
    };
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return {
      statusCode: 500,
      headers: buildHeaders(event.headers.origin || event.headers.Origin),
      body: JSON.stringify({ ok: false, error: 'Telegram environment variables are not configured' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const message = String(body.message || '').trim();

    if (!message) {
      return {
        statusCode: 400,
        headers: buildHeaders(event.headers.origin || event.headers.Origin),
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
        headers: buildHeaders(event.headers.origin || event.headers.Origin),
        body: JSON.stringify({
          ok: false,
          error: result?.description || 'Telegram request failed'
        })
      };
    }

    return {
      statusCode: 200,
      headers: buildHeaders(event.headers.origin || event.headers.Origin),
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: buildHeaders(event.headers.origin || event.headers.Origin),
      body: JSON.stringify({ ok: false, error: error.message || 'Server error' })
    };
  }
};
