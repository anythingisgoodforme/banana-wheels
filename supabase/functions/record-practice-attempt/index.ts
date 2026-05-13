const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS')
    return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== 'POST') return json({ ok: false, message: 'Use POST' }, 405);

  const payload = await request.json().catch(() => ({}));
  return json({
    ok: true,
    status: 200,
    message:
      'Practice attempt received. Wire this function to the practice_attempts table before production use.',
    attempt: {
      playerId: payload.playerId || 'anonymous',
      lessonId: payload.lessonId || 'unknown',
      target: payload.target || null,
      detected: payload.detected || null,
      correct: Boolean(payload.correct),
      createdAt: new Date().toISOString(),
    },
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
