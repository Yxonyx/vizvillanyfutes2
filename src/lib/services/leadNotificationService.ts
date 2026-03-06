// =====================================================
// Lead Notification Service
// Unified branded email templates for all transactional emails
// =====================================================

import { createAdminClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vizvillanyfutes.hu';

// ---- Shared Premium HTML Email Shell ----
// Used by ALL email senders across the app for consistent branding
export function wrapHtml(title: string, body: string, options?: { accentColor?: string }): string {
  const accent = options?.accentColor || '#0062B8';
  return `<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<div style="max-width:640px;margin:20px auto;padding:0 12px;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,${accent} 0%,#0088E0 100%);border-radius:16px 16px 0 0;padding:20px 24px 16px;text-align:center;">
    <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">⚡ VízVillanyFűtés</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:3px;letter-spacing:0.8px;text-transform:uppercase;">Megbízható szakemberek, gyorsan</div>
  </div>
  <!-- Body -->
  <div style="background:#ffffff;padding:20px 24px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
    ${body}
  </div>
  <!-- Footer -->
  <div style="background:#f8fafc;border-radius:0 0 16px 16px;padding:14px 24px;border:1px solid #e2e8f0;border-top:none;text-align:center;">
    <div style="font-size:11px;color:#94a3b8;line-height:1.5;">
      Automatikus értesítés • <a href="${BASE_URL}" style="color:#64748b;text-decoration:none;">vizvillanyfutes.hu</a> • © ${new Date().getFullYear()}
    </div>
  </div>
</div>
</body>
</html>`;
}

// ---- Reusable HTML building blocks (compact) ----
function badge(text: string, bg = '#e0f2fe', color = '#0369a1'): string {
  return `<div style="text-align:center;margin-bottom:10px;">
      <span style="display:inline-block;background:${bg};color:${color};font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:0.5px;">${text}</span>
    </div>`;
}

function heading(text: string): string {
  return `<h1 style="font-size:20px;font-weight:800;margin:0 0 8px;color:#0f172a;text-align:center;line-height:1.3;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 10px;">${text}</p>`;
}

function infoBox(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows.map(r =>
    `<tr><td style="padding:5px 10px;font-size:13px;color:#94a3b8;font-weight:600;white-space:nowrap;">${r.label}</td><td style="padding:5px 10px;font-size:13px;color:#1e293b;font-weight:700;text-align:right;">${r.value}</td></tr>`
  ).join('');
  return `<table style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;border-collapse:separate;border-spacing:0;margin:10px 0;overflow:hidden;">${rowsHtml}</table>`;
}

function button(text: string, href: string, color = '#0062B8'): string {
  return `<div style="text-align:center;margin:14px 0 6px;">
      <a href="${href}" style="display:inline-block;background:${color};color:#ffffff!important;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">${text}</a>
    </div>`;
}

function divider(): string {
  return `<div style="border-top:1px solid #e2e8f0;margin:12px 0;"></div>`;
}

// ---- Internal send helper ----
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`📧 [DEV] Email to: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: 'VízVillanyFűtés <info@vizvillanyfutes.hu>',
      to,
      subject,
      html,
    });
    if (error) {
      console.error('📧 Email send error:', error);
    } else {
      console.log(`📧 Email sent: ${subject} → ${to}`);
    }
  } catch (err) {
    console.error('📧 Failed to send email:', err);
  }
}

// Also export sendEmail for use by other modules
export { sendEmail };

// =====================================================
// 1. CUSTOMER: Job Created
// =====================================================
export async function notifyCustomerJobCreated(params: {
  customerEmail: string;
  customerName: string;
  jobTitle: string;
  trade: string;
}): Promise<void> {
  const tradeLabel: Record<string, string> = {
    viz: 'Vízszerelés', villany: 'Villanyszerelés',
    futes: 'Fűtésszerelés', combined: 'Kombinált'
  };

  const html = wrapHtml('Munka bejelentve', `
    ${badge('Bejelentés fogadva', '#d1fae5', '#065f46')}
    ${heading(`Köszönjük, ${params.customerName}!`)}
    ${paragraph('A munkád sikeresen rögzítve lett rendszerünkben. Máris értesítettük a környékbeli szakembereket — hamarosan jelentkeznek!')}
    ${infoBox([
    { label: 'Munka', value: params.jobTitle },
    { label: 'Típus', value: tradeLabel[params.trade] || params.trade },
  ])}
    ${paragraph('<strong>Tipp:</strong> Figyeld a Dashboard-odat! Ha egy szakember jelentkezik, azonnal értesítünk e-mailben is. Ott tudod majd megnézni a profilját, és elfogadni vagy elutasítani.')}
    ${button('Megnyitom a Dashboardot', `${BASE_URL}/ugyfel/dashboard`)}
  `);

  await sendEmail(params.customerEmail, 'Munkád rögzítve – várjuk a szakemberek jelentkezését', html);
}

// =====================================================
// 2. CUSTOMER: Contractor Applied (Interest Pending)
// =====================================================
export async function notifyCustomerContractorApplied(params: {
  customerEmail: string;
  customerName: string;
  contractorName: string;
  jobTitle: string;
}): Promise<void> {
  const html = wrapHtml('Szakember jelentkezett', `
    ${badge('Új jelentkező', '#dbeafe', '#1e40af')}
    ${heading('Nagyszerű hír, ${params.customerName}!')}
    ${paragraph(`<strong>${params.contractorName}</strong> nevű tapasztalt szakember jelentkezett a munkádra! Ez azt jelenti, hogy készen áll elvállalni a feladatot.`)}
    ${infoBox([
    { label: 'Munka', value: params.jobTitle },
    { label: 'Jelentkező', value: params.contractorName },
  ])}
    ${paragraph('Lépj be a profilodba, nézd meg a szakember adatait, és dönts: <strong>elfogadod vagy elutasítod</strong> a jelentkezését. Az elfogadás után azonnal megkapod a szakember telefonszámát.')}
    ${button('Megnézem és döntök', `${BASE_URL}/ugyfel/dashboard`, '#059669')}
  `.replace('${params.customerName}', params.customerName));

  await sendEmail(params.customerEmail, `${params.contractorName} jelentkezett a munkádra`, html);
}

// =====================================================
// 3. CUSTOMER: Acceptance Confirmed
// =====================================================
export async function notifyCustomerAcceptanceConfirmed(params: {
  customerEmail: string;
  customerName: string;
  contractorName: string;
  contractorPhone: string;
  jobTitle: string;
}): Promise<void> {
  const html = wrapHtml('Szakember elfogadva', `
    ${badge('Összekapcsolva', '#d1fae5', '#065f46')}
    ${heading('Tökéletes választás, ${params.customerName}!')}
    ${paragraph(`Sikeresen elfogadtad <strong>${params.contractorName}</strong> szakembert! Mostantól közvetlenül felveheted vele a kapcsolatot az alábbi elérhetőségen.`)}
    ${infoBox([
    { label: 'Szakember', value: params.contractorName },
    { label: 'Telefon', value: `<a href="tel:${params.contractorPhone}" style="color:#059669;text-decoration:none;font-weight:800;">${params.contractorPhone}</a>` },
    { label: 'Munka', value: params.jobTitle },
  ])}
    ${paragraph('<strong>Javaslatunk:</strong> Hívd fel a szakembert mielőbb, és egyeztessétek a pontos időpontot és részleteket. Jó munkát kívánunk!')}
    ${button('Dashboard megnyitása', `${BASE_URL}/ugyfel/dashboard`)}
  `.replace('${params.customerName}', params.customerName));

  await sendEmail(params.customerEmail, `Összekapcsoltunk: ${params.contractorName} – hívd fel`, html);
}

// =====================================================
// 4. CONTRACTOR: Interest Submitted (Escrow)
// =====================================================
export async function notifyContractorInterestSubmitted(params: {
  contractorEmail: string;
  contractorName: string;
  jobTitle: string;
  escrowAmount: number;
}): Promise<void> {
  const html = wrapHtml('Jelentkezés rögzítve', `
    ${badge('Jelentkezés elküldve', '#dbeafe', '#1e40af')}
    ${heading('Jelentkezésed rögzítettük, ${params.contractorName}!')}
    ${paragraph(`Sikeresen jelezted érdeklődésedet az alábbi munkára. <strong>${params.escrowAmount.toLocaleString('hu-HU')} Ft</strong> zárolásra került az egyenlegeden — ez csak akkor kerül levonásra, ha az ügyfél elfogad.`)}
    ${infoBox([
    { label: 'Munka', value: params.jobTitle },
    { label: 'Zárolt összeg', value: `${params.escrowAmount.toLocaleString('hu-HU')} Ft` },
  ])}
    ${paragraph('Az ügyfél döntését követően e-mailben értesítünk. Ha <strong>elfogad</strong>, megkapod az ügyfél elérhetőségeit és indulhat a munka. Ha <strong>elutasít</strong>, a zárolás automatikusan feloldásra kerül.')}
    ${button('Dashboard megnyitása', `${BASE_URL}/contractor/dashboard`)}
  `.replace('${params.contractorName}', params.contractorName));

  await sendEmail(params.contractorEmail, `Jelentkezésed rögzítve – ${params.jobTitle}`, html);
}

// =====================================================
// 5. CONTRACTOR: Customer Accepted
// =====================================================
export async function notifyContractorAccepted(params: {
  contractorEmail: string;
  contractorName: string;
  customerName: string;
  customerPhone: string;
  jobTitle: string;
}): Promise<void> {
  const html = wrapHtml('Elfogadtak!', `
    ${badge('Elfogadva', '#d1fae5', '#065f46')}
    ${heading('Gratulálunk, ${params.contractorName}!')}
    ${paragraph('Nagyszerű hír — az ügyfél elfogadta a jelentkezésedet! Most már közvetlenül felveheted a kapcsolatot és egyeztethetitek a részleteket.')}
    ${infoBox([
    { label: 'Ügyfél', value: params.customerName },
    { label: 'Telefon', value: `<a href="tel:${params.customerPhone}" style="color:#059669;text-decoration:none;font-weight:800;">${params.customerPhone}</a>` },
    { label: 'Munka', value: params.jobTitle },
  ])}
    ${paragraph('<strong>Fontos:</strong> Kérjük, mielőbb vedd fel a kapcsolatot az ügyféllel! Az ügyfelek értékelik a gyors reakciót — ez javítja a profilod értékelését is.')}
    ${button('Dashboard megnyitása', `${BASE_URL}/contractor/dashboard`, '#059669')}
  `.replace('${params.contractorName}', params.contractorName));

  await sendEmail(params.contractorEmail, `Elfogadtak! ${params.customerName} vár rád – ${params.jobTitle}`, html);
}

// =====================================================
// 6. CONTRACTOR: Customer Rejected (Refund)
// =====================================================
export async function notifyContractorRejected(params: {
  contractorEmail: string;
  contractorName: string;
  jobTitle: string;
  refundAmount: number;
}): Promise<void> {
  const html = wrapHtml('Ügyfél mást választott', `
    ${badge('Elutasítva', '#fef2f2', '#991b1b')}
    ${heading('Sajnos az ügyfél mást választott')}
    ${paragraph(`Kedves ${params.contractorName}, sajnos az ügyfél elutasította a jelentkezésedet az alábbi munkára. De ne csüggedj — <strong>a zárolt összeget visszatérítettük</strong> az egyenlegedre!`)}
    ${infoBox([
    { label: 'Munka', value: params.jobTitle },
    { label: 'Visszatérítés', value: `<span style="color:#059669;font-weight:800;">${params.refundAmount.toLocaleString('hu-HU')} Ft</span>` },
  ])}
    ${paragraph('Nézz körül a piactéren — új munkák folyamatosan érkeznek! A kitartás kifizetődik.')}
    ${button('Új munkák keresése', `${BASE_URL}/contractor/dashboard`)}
  `);

  await sendEmail(params.contractorEmail, `Visszatérítés: ${params.refundAmount.toLocaleString('hu-HU')} Ft – ${params.jobTitle}`, html);
}

// =====================================================
// 7. CUSTOMER: Rating Request (after job completion)
// =====================================================
export async function notifyCustomerRatingRequest(params: {
  customerEmail: string;
  customerName: string;
  contractorName: string;
  jobTitle: string;
  jobId: string;
}): Promise<void> {
  const html = wrapHtml('Értékeld a szakembert', `
    ${badge('Munka befejezve', '#d1fae5', '#065f46')}
    ${heading('Hogy tetszett a munka, ${params.customerName}?')}
    ${paragraph(`<strong>${params.contractorName}</strong> befejezte a munkát: <em>${params.jobTitle}</em>. Reméljük elégedett voltál a szolgáltatással!`)}
    ${divider()}
    <div style="text-align:center;margin:20px 0;">
      <div style="font-size:32px;letter-spacing:4px;color:#f59e0b;">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
      <div style="font-size:13px;color:#64748b;margin-top:6px;">Kérjük értékeld 1-5 csillaggal</div>
    </div>
    ${divider()}
    ${paragraph('Az értékelésed segít más ügyfeleknek megtalálni a legjobb szakembereket, és motiválja a mestereket a minőségi munkára. Csak egy perc az egész!')}
    ${button('Értékelés megadása', `${BASE_URL}/ugyfel/dashboard?rate=${params.jobId}`, '#0062B8')}
    ${paragraph('<span style="font-size:12px;color:#94a3b8;">Az értékelés névtelenül jelenik meg a szakember profilján.</span>')}
  `.replace('${params.customerName}', params.customerName));

  await sendEmail(params.customerEmail, `Értékeld ${params.contractorName} munkáját – ${params.jobTitle}`, html);
}

// =====================================================
// Helper: Fetch email by user_id from Supabase Auth
// =====================================================
export async function getEmailByUserId(userId: string): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.auth.admin.getUserById(userId);
    return data?.user?.email || null;
  } catch {
    return null;
  }
}

// =====================================================
// Helper: Fetch contractor email by contractor_profile_id
// =====================================================
export async function getContractorEmail(contractorProfileId: string): Promise<{ email: string | null; name: string }> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('contractor_profiles')
      .select('user_id, display_name')
      .eq('id', contractorProfileId)
      .single();
    if (!data) return { email: null, name: 'Szakember' };
    const email = await getEmailByUserId(data.user_id);
    return { email, name: data.display_name };
  } catch {
    return { email: null, name: 'Szakember' };
  }
}
