const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS')
    return new Response(null, { status: 204, headers: corsHeaders });

  return new Response(
    JSON.stringify({
      ok: false,
      status: 501,
      message:
        'Raw audio analysis is documented as server version 2, but the first hosted demo keeps pitch detection in the browser for privacy and latency.',
    }),
    { status: 501, headers: { ...corsHeaders, 'content-type': 'application/json' } }
  );
});
