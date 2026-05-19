const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const MAX_MESSAGE_LENGTH = 3500;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map();

const allowedOrigins = new Set([
  'https://easy-asylum.com',
  'https://www.easy-asylum.com'
]);

function buildHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://easy-asylum.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

function getClientKey(event) {
  const forwardedFor = event.headers['x-forwarded-for'] || event.headers['X-Forwarded-For'] || '';
  return forwardedFor.split(',')[0].trim() || event.headers['client-ip'] || 'unknown';
}

function isRateLimited(key) {
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(key, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: buildHeaders(origin),
      body: ''
    };
  }

  if (origin && !allowedOrigins.has(origin)) {
    return {
      statusCode: 403,
      headers: buildHeaders(origin),
      body: JSON.stringify({ ok: false, error: 'Origin is not allowed' })
    };
  }

  if (isRateLimited(getClientKey(event))) {
    return {
      statusCode: 429,
      headers: buildHeaders(origin),
      body: JSON.stringify({ ok: false, error: 'Too many requests' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...buildHeaders(origin), Allow: 'POST' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' })
    };
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return {
      statusCode: 500,
      headers: buildHeaders(origin),
      body: JSON.stringify({ ok: false, error: 'Telegram environment variables are not configured' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const message = String(body.message || '').trim();
    const honeypot = String(body.company || '').trim();

    if (honeypot) {
      return {
        statusCode: 200,
        headers: buildHeaders(origin),
        body: JSON.stringify({ ok: true })
      };
    }

    if (!message) {
      return {
        statusCode: 400,
        headers: buildHeaders(origin),
        body: JSON.stringify({ ok: false, error: 'Message is required' })
      };
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return {
        statusCode: 413,
        headers: buildHeaders(origin),
        body: JSON.stringify({ ok: false, error: 'Message is too long' })
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
        headers: buildHeaders(origin),
        body: JSON.stringify({
          ok: false,
          error: result?.description || 'Telegram request failed'
        })
      };
    }

    return {
      statusCode: 200,
      headers: buildHeaders(origin),
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: buildHeaders(origin),
      body: JSON.stringify({ ok: false, error: error.message || 'Server error' })
    };
  }
};
