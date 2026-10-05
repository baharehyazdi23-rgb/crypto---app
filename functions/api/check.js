export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const formData = await request.formData();
    const code = (formData.get('code') || '').trim().toUpperCase();
    const deviceId = formData.get('device_id') || 'unknown';

    if (!code) {
      return jsonResponse({ ok: false, msg: 'رمز وارد نشده' });
    }

    // از KV می‌خونیم
    const codeData = await env.CODES.get(code, 'json');

    if (!codeData) {
      return jsonResponse({ ok: false, msg: 'رمز نامعتبر است' });
    }

    if (codeData.used === true) {
      return jsonResponse({ ok: false, msg: 'این رمز قبلاً استفاده شده' });
    }

    // مصرف رمز
    codeData.used = true;
    codeData.used_at = new Date().toISOString();
    codeData.ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    codeData.device_id = deviceId;
    await env.CODES.put(code, JSON.stringify(codeData));

    return jsonResponse({ ok: true, msg: 'خوش آمدید' });
  } catch (e) {
    return jsonResponse({ ok: false, msg: 'خطای سرور' });
  }
}

function jsonResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
