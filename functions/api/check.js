export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };

  try {
    const formData = await request.formData();
    const code = (formData.get('code') || '').trim().toUpperCase();
    const deviceId = formData.get('device_id') || 'unknown';

    if (!code) {
      return new Response(JSON.stringify({ ok: false, msg: 'رمز وارد نشده' }), {
        headers: corsHeaders
      });
    }

    // خوندن لیست رمزها از KV یا از فایل
    let codeData = null;

    if (env.CODES) {
      // اگه KV وصل بود
      codeData = await env.CODES.get(code, 'json');
    } else {
      // از فایل codes.json می‌خونیم
      const codesRes = await fetch(new URL('/api/codes', request.url));
      const codes = await codesRes.json();
      codeData = codes[code];
    }

    if (!codeData) {
      return new Response(JSON.stringify({ ok: false, msg: 'رمز نامعتبر است' }), {
        headers: corsHeaders
      });
    }

    if (codeData.used === true) {
      return new Response(JSON.stringify({ ok: false, msg: 'این رمز قبلاً استفاده شده' }), {
        headers: corsHeaders
      });
    }

    // مصرف رمز
    codeData.used = true;
    codeData.used_at = new Date().toISOString();
    codeData.ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    codeData.device_id = deviceId;

    if (env.CODES) {
      await env.CODES.put(code, JSON.stringify(codeData));
    }

    return new Response(JSON.stringify({ ok: true, msg: 'خوش آمدید' }), {
      headers: corsHeaders
    });

  } catch (e) {
    return new Response(JSON.stringify({ ok: false, msg: 'خطای سرور: ' + e.message }), {
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
