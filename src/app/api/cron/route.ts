import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log("Hi! Cron job רץ עכשיו!");

  return NextResponse.json({ ok: true, message: "Hi printed to console" });
}
