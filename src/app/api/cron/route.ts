import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

export async function GET(req: Request) {
  //const auth = req.headers.get('Authorization');
  // if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  console.log("Sending cron email...");

  try {
    await sgMail.send({
      to: process.env.TO_EMAIL!,      
      from: process.env.FROM_EMAIL!,   
      subject: 'Hi from Cron Job!',
      text: "It's 14:15 now",
    });

    return NextResponse.json({ ok: true, message: 'Email sent!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
