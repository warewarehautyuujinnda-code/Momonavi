import type { Submission } from "@shared/schema";

interface MailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

function getMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return { host, port: parseInt(port, 10), user, pass, from };
}

async function sendMail(to: string, subject: string, body: string): Promise<boolean> {
  const config = getMailConfig();
  if (!config) {
    console.warn("[mail] SMTP not configured — skipping email send. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM.");
    return false;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
    });

    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text: body,
    });

    console.log(`[mail] Sent email to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error(`[mail] Failed to send email to ${to}:`, error);
    return false;
  }
}

export async function sendAdminNotification(submission: Submission): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("[mail] ADMIN_EMAIL not set — skipping admin notification.");
    return false;
  }

  const subject = `【新歓ナビ】新しい掲載依頼: ${submission.groupName}`;
  const body = [
    `新しい掲載依頼が届きました。`,
    ``,
    `--- 申請者情報 ---`,
    `メール: ${submission.requesterEmail}`,
    submission.requesterName ? `名前: ${submission.requesterName}` : null,
    ``,
    `--- 団体情報 ---`,
    `団体名: ${submission.groupName}`,
    `大学: ${submission.groupUniversity}`,
    `区分: ${submission.groupCategory}`,
    `ジャンル: ${submission.groupGenre}`,
    `説明: ${submission.groupDescription}`,
    `雰囲気タグ: ${submission.groupAtmosphereTags.join(', ')}`,
    submission.groupContactInfo ? `連絡先: ${submission.groupContactInfo}` : null,
    submission.groupInstagramUrl ? `Instagram: ${submission.groupInstagramUrl}` : null,
    submission.groupTwitterUrl ? `Twitter: ${submission.groupTwitterUrl}` : null,
    submission.groupLineUrl ? `LINE: ${submission.groupLineUrl}` : null,
    ``,
    submission.eventTitle ? `--- イベント情報 ---` : null,
    submission.eventTitle ? `イベント名: ${submission.eventTitle}` : null,
    submission.eventDescription ? `説明: ${submission.eventDescription}` : null,
    submission.eventDate ? `日時: ${submission.eventDate}` : null,
    submission.eventLocation ? `場所: ${submission.eventLocation}` : null,
    ``,
    submission.message ? `--- メッセージ ---` : null,
    submission.message ? submission.message : null,
    ``,
    `申請ID: ${submission.id}`,
    `送信日時: ${submission.createdAt}`,
  ].filter(Boolean).join('\n');

  return sendMail(adminEmail, subject, body);
}

export async function sendApprovalNotification(submission: Submission): Promise<boolean> {
  const subject = `【新歓ナビ】掲載が承認されました: ${submission.groupName}`;
  const body = [
    `${submission.requesterName || '申請者'} 様`,
    ``,
    `この度は新歓ナビへの掲載依頼をいただきありがとうございます。`,
    `以下の内容が承認され、サイトに掲載されました。`,
    ``,
    `団体名: ${submission.groupName}`,
    submission.eventTitle ? `イベント名: ${submission.eventTitle}` : null,
    ``,
    `サイトをご確認ください。`,
    `何かご不明な点がございましたら、お気軽にお問い合わせください。`,
    ``,
    `新歓ナビ運営チーム`,
  ].filter(Boolean).join('\n');

  return sendMail(submission.requesterEmail, subject, body);
}
