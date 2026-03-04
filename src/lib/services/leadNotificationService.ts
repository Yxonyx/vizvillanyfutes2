// =====================================================
// Lead Notification Service
// Sends transactional emails at key points in the lead lifecycle
// =====================================================

import { createAdminClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vizvillanyfutes.hu';

// ---- HTML Email Template ----
function wrapHtml(title: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;color:#1e293b}
  .wrap{max-width:600px;margin:0 auto;padding:24px 16px}
  .card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  .logo{text-align:center;margin-bottom:24px;font-size:20px;font-weight:800;color:#1e40af}
  .badge{display:inline-block;background:#e0f2fe;color:#0369a1;font-size:12px;font-weight:700;padding:4px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px}
  h1{font-size:22px;font-weight:800;margin:0 0 12px;color:#0f172a}
  p{font-size:15px;line-height:1.6;color:#475569;margin:0 0 16px}
  .info-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0}
  .info-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}
  .info-label{color:#94a3b8;font-weight:600}
  .info-value{color:#1e293b;font-weight:700}
  .btn{display:inline-block;background:#1e40af;color:#fff!important;font-size:15px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;margin-top:8px}
  .btn-green{background:#059669}
  .footer{text-align:center;margin-top:24px;font-size:12px;color:#94a3b8}
  .footer a{color:#64748b}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="logo">⚡ VízVillanyFűtés</div>
    ${body}
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} VízVillanyFűtés • <a href="${BASE_URL}">vizvillanyfutes.hu</a></p>
    <p style="margin-top:4px">Ez egy automatikus értesítés, kérjük ne válaszolj erre az e-mailre.</p>
  </div>
</div>
</body>
</html>`;
}

// ---- Internal send helper (calls our own API or Resend directly) ----
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
    // Use Resend directly if API key is available (server-side)
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
    <div class="badge">Bejelentés fogadva</div>
    <h1>Köszönjük, ${params.customerName}!</h1>
    <p>A munkád sikeresen rögzítve lett, és automatikusan értesítettük a környékbeli mestereket.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Munka</span><span class="info-value">${params.jobTitle}</span></div>
      <div class="info-row"><span class="info-label">Típus</span><span class="info-value">${tradeLabel[params.trade] || params.trade}</span></div>
    </div>
    <p>Figyeld a Dashboard-ot — ha egy szakember jelentkezik, e-mailben is értesítünk! Ott tudod majd elfogadni vagy elutasítani.</p>
    <a href="${BASE_URL}/ugyfel/dashboard" class="btn">Megnyitom a Dashboardot →</a>
  `);

    await sendEmail(params.customerEmail, '✅ Munkád rögzítve – várjuk a szakemberek jelentkezését!', html);
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
    <div class="badge">🔔 Új jelentkező</div>
    <h1>Szakember érdeklődik a munkád iránt!</h1>
    <p>Kedves ${params.customerName},</p>
    <p><strong>${params.contractorName}</strong> nevű szakember jelezte érdeklődését a következő munkádra:</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Munka</span><span class="info-value">${params.jobTitle}</span></div>
      <div class="info-row"><span class="info-label">Szakember</span><span class="info-value">${params.contractorName}</span></div>
    </div>
    <p>Lépj be a profilodba, nézd meg a szakember adatait, és dönts: <strong>elfogadod vagy elutasítod</strong> a jelentkezését!</p>
    <a href="${BASE_URL}/ugyfel/dashboard" class="btn btn-green">Megnézem és döntök →</a>
  `);

    await sendEmail(params.customerEmail, `🔔 ${params.contractorName} jelentkezett a munkádra!`, html);
}

// =====================================================
// 3. CUSTOMER: Acceptance Confirmed (after they accepted)
// =====================================================
export async function notifyCustomerAcceptanceConfirmed(params: {
    customerEmail: string;
    customerName: string;
    contractorName: string;
    contractorPhone: string;
    jobTitle: string;
}): Promise<void> {
    const html = wrapHtml('Szakember elfogadva', `
    <div class="badge" style="background:#d1fae5;color:#065f46">✅ Összekapcsolva</div>
    <h1>Sikeresen elfogadtad a szakembert!</h1>
    <p>Kedves ${params.customerName},</p>
    <p>Mostantól <strong>${params.contractorName}</strong> a te kiválasztott szerelőd. Vedd fel vele a kapcsolatot az alábbi elérhetőségen:</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Szakember</span><span class="info-value">${params.contractorName}</span></div>
      <div class="info-row"><span class="info-label">Telefon</span><span class="info-value"><a href="tel:${params.contractorPhone}">${params.contractorPhone}</a></span></div>
      <div class="info-row"><span class="info-label">Munka</span><span class="info-value">${params.jobTitle}</span></div>
    </div>
    <p>Jó munkát kívánunk! Ha bármi probléma merülne fel, keresd a kapcsolat oldalunkat.</p>
  `);

    await sendEmail(params.customerEmail, `✅ Összekapcsoltunk: ${params.contractorName} – hívd fel!`, html);
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
    const html = wrapHtml('Érdeklődés rögzítve', `
    <div class="badge">Érdeklődés elküldve</div>
    <h1>Sikeresen jelezted az érdeklődésed!</h1>
    <p>Kedves ${params.contractorName},</p>
    <p>Az érdeklődésed a következő munkára rögzítve lett. <strong>${params.escrowAmount.toLocaleString('hu-HU')} Ft</strong> zárolásra került az egyenlegeden.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Munka</span><span class="info-value">${params.jobTitle}</span></div>
      <div class="info-row"><span class="info-label">Zárolt összeg</span><span class="info-value">${params.escrowAmount.toLocaleString('hu-HU')} Ft</span></div>
    </div>
    <p>Az ügyfél döntését követően e-mailben értesítünk. Ha elfogad, megkapod az ügyfél elérhetőségeit. Ha elutasít, a zárolás feloldásra kerül.</p>
    <a href="${BASE_URL}/contractor/dashboard" class="btn">Dashboard megnyitása →</a>
  `);

    await sendEmail(params.contractorEmail, `⏳ Érdeklődésed rögzítve – ${params.jobTitle}`, html);
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
    const html = wrapHtml('Ügyfél elfogadta', `
    <div class="badge" style="background:#d1fae5;color:#065f46">🎉 Elfogadva</div>
    <h1>Gratulálunk, ${params.contractorName}!</h1>
    <p>Az ügyfél elfogadta a jelentkezésedet. Vedd fel a kapcsolatot vele:</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Ügyfél</span><span class="info-value">${params.customerName}</span></div>
      <div class="info-row"><span class="info-label">Telefon</span><span class="info-value"><a href="tel:${params.customerPhone}">${params.customerPhone}</a></span></div>
      <div class="info-row"><span class="info-label">Munka</span><span class="info-value">${params.jobTitle}</span></div>
    </div>
    <p>Kérjük mielőbb vedd fel a kapcsolatot az ügyféllel és egyeztessétek a részleteket!</p>
    <a href="${BASE_URL}/contractor/dashboard" class="btn btn-green">Dashboard megnyitása →</a>
  `);

    await sendEmail(params.contractorEmail, `🎉 Elfogadtak! ${params.customerName} vár rád – ${params.jobTitle}`, html);
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
    const html = wrapHtml('Ügyfél elutasította', `
    <div class="badge" style="background:#fef2f2;color:#991b1b">Elutasítva</div>
    <h1>Az ügyfél mást választott</h1>
    <p>Kedves ${params.contractorName},</p>
    <p>Sajnos az ügyfél elutasította a jelentkezésedet a következő munkára:</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Munka</span><span class="info-value">${params.jobTitle}</span></div>
      <div class="info-row"><span class="info-label">Visszatérítés</span><span class="info-value" style="color:#059669">${params.refundAmount.toLocaleString('hu-HU')} Ft</span></div>
    </div>
    <p>A zárolt összeget visszatérítettük az egyenlegedre. Nézz körül a piactéren – új munkák folyamatosan érkeznek!</p>
    <a href="${BASE_URL}/contractor/dashboard" class="btn">Új munkák keresése →</a>
  `);

    await sendEmail(params.contractorEmail, `💰 Visszatérítés: ${params.refundAmount.toLocaleString('hu-HU')} Ft – ${params.jobTitle}`, html);
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
