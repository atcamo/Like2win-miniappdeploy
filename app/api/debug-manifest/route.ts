export async function GET() {
  const manifest = {
    debug: "This is a debug endpoint",
    timestamp: new Date().toISOString(),
    baseBuilder: {
      allowedAddresses: ["0xeeddD28142417ADda1bd1C64dD158aA53De4CAa6"]
    },
    test: "If you see this, the endpoint is working"
  };

  return Response.json(manifest);
}