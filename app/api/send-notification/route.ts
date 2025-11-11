import { NextRequest, NextResponse } from 'next/server';
import { resend } from '../../../lib/resend';

export async function POST(request: NextRequest) {
  try {
    const { email, projectTitle, deadline, clientName } = await request.json();

    if (!email || !projectTitle || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const deadlineDate = new Date(deadline);
    const notificationDate = new Date(deadlineDate.getTime() - 3 * 24 * 60 * 60 * 1000);

    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedNotificationDate = notificationDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const { data, error } = await resend.emails.send({
      from: 'Task Tracker <onboarding@resend.dev>',
      to: [email],
      subject: `Reminder: ${projectTitle} deadline approaching`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(to right, #2563eb, #4f46e5);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .project-title {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin: 10px 0;
              }
              .info-box {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #2563eb;
              }
              .deadline {
                font-size: 18px;
                color: #dc2626;
                font-weight: bold;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 Deadline Reminder</h1>
              </div>
              <div class="content">
                <p>Hello!</p>
                <p>This is a friendly reminder that your project deadline is approaching in 3 days.</p>
                
                <div class="info-box">
                  <div class="project-title">${projectTitle}</div>
                  ${clientName ? `<p><strong>Client:</strong> ${clientName}</p>` : ''}
                  <p><strong>Deadline:</strong> <span class="deadline">${formattedDeadline}</span></p>
                  <p><strong>Reminder Date:</strong> ${formattedNotificationDate}</p>
                </div>
                
                <p>Make sure you're on track to complete all tasks before the deadline!</p>
                <p>Stay organized and finish strong!</p>
              </div>
              <div class="footer">
                <p>This notification was set up through Task Tracker</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
