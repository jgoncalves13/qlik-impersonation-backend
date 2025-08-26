// api/access-token.js
export default async function handler(req, res) {
  // CORS (acepta requests desde tu GitHub Pages)
  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'; // p.ej. https://usuario.github.io
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // opcional: exige alguna forma de auth / validación aquí (ver sección Seguridad)
    const body = req.body || {};
    // subject: el identificador del usuario a impersonar (ej: el "sub" del IdP o email)
    const subject = body.subject || process.env.DEFAULT_SUBJECT;

    const payload = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'urn:qlik:oauth:user-impersonation',
      user_lookup: { field: 'subject', value: subject },
      scope: 'user_default'
    };

    const tokenResp = await fetch(`${process.env.TENANT_HOST}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const tokenJson = await tokenResp.json();

    if (!tokenResp.ok) {
      // reenvía error hacia el frontend para debug
      return res.status(tokenResp.status).json(tokenJson);
    }

    // retorna JSON con { access_token, expires_in, ... } (seguimos el ejemplo oficial)
    return res.status(200).json(tokenJson);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
