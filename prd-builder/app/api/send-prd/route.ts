import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, prdData, pdfBase64 } = await req.json();

    if (!email || !prdData) {
      return NextResponse.json(
        { error: 'Missing email or prdData' },
        { status: 400 }
      );
    }

    // TODO: Replace with your email service
    // Example using nodemailer (requires setup):
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: email,
    //   subject: `אפיון אתר: ${prdData.title}`,
    //   html: generateEmailHTML(prdData),
    //   attachments: pdfBase64 ? [{
    //     filename: `${prdData.title}.pdf`,
    //     content: Buffer.from(pdfBase64, 'base64'),
    //   }] : [],
    // });

    // For now, return success (integrate your email service)
    console.log(`Email would be sent to ${email} with PRD:`, prdData);

    return NextResponse.json({
      success: true,
      message: `הקובץ נשלח בהצלחה ל-${email}`,
    });
  } catch (error) {
    console.error('Send PRD error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

function generateEmailHTML(prdData: any) {
  return `
    <html dir="rtl">
      <head><meta charset="utf-8" /></head>
      <body style="font-family: Arial; direction: rtl; text-align: right;">
        <h1>אפיון אתר: ${prdData.title}</h1>
        <p><strong>סוג העסק:</strong> ${prdData.businessType}</p>
        <p><strong>שם איש הקשר:</strong> ${prdData.contactName}</p>
        <p><strong>אימייל:</strong> ${prdData.contactEmail}</p>
        <p><strong>מטרות:</strong></p>
        <p>${prdData.projectGoals}</p>
        <hr />
        <p>מסמך זה נוצר בעזרת <strong>מערכת אפיון אתרים</strong></p>
      </body>
    </html>
  `;
}
