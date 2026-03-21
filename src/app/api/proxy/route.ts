export async function GET() {
  try {
    const response = await fetch("http://100.126.86.46:3001/api/status");
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
