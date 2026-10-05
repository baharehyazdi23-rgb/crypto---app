export async function onRequestGet() {
  const codes = {
    "TEST01": { used: false },
    "CRYPTO1": { used: false },
    "CRYPTO2": { used: false },
    "VIP001": { used: false }
  };
  return new Response(JSON.stringify(codes), {
    headers: { 'Content-Type': 'application/json' }
  });
}
