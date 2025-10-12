// Respond to Chrome DevTools well-known probe to avoid noisy 404s in dev
export async function GET() {
  return new Response("{}", {
    headers: { "content-type": "application/json" },
    status: 200,
  });
}

export const dynamic = "force-static";
