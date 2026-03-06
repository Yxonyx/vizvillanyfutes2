import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { wrapHtml } from '@/lib/services/leadNotificationService';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vizvillanyfutes.hu';

// ---- Reusable HTML helpers (matching leadNotificationService style) ----
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

// ---- Format booking email (HTML) ----
function formatBookingHtml(data: Record<string, unknown>): string {
  const tradeLabel: Record<string, string> = {
    viz: '💧 Vízszerelés', villany: '⚡ Villanyszerelés',
    futes: '🔥 Fűtésszerelés', combined: '🔧 Kombinált'
  };
  return wrapHtml('Új időpontfoglalás', `
    ${badge('📅 Új foglalás', '#dbeafe', '#1e40af')}
    ${heading('Új időpontfoglalás érkezett!')}
    ${paragraph(`<strong>${data.name || 'Ügyfél'}</strong> új időpontfoglalást küldött be.`)}
    ${infoBox([
    { label: 'Kategória', value: String(data.category || '-') },
    { label: 'Probléma', value: String(data.problem || '-') },
    { label: 'Dátum', value: String(data.selectedDate || '-') },
    { label: 'Időpont', value: String(data.selectedTime || '-') },
  ])}
    ${infoBox([
    { label: 'Név', value: String(data.name || '-') },
    { label: 'Telefon', value: String(data.phone || '-') },
    { label: 'Email', value: String(data.email || '-') },
    { label: 'Cím', value: `${data.city || ''} ${data.district || ''}. ker, ${data.address || ''}` },
  ])}
    ${data.description ? paragraph(`<strong>Leírás:</strong> ${data.description}`) : ''}
    ${data.isSOS ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;margin:12px 0;text-align:center;font-weight:700;color:#991b1b;">🚨 SOS SÜRGŐS</div>` : ''}
  `);
}

// ---- Format contact email (HTML) ----
function formatContactHtml(data: Record<string, unknown>): string {
  return wrapHtml('Új kapcsolat üzenet', `
    ${badge('✉️ Kapcsolat', '#e0f2fe', '#0369a1')}
    ${heading('Új üzenet érkezett!')}
    ${infoBox([
    { label: 'Név', value: String(data.name || '-') },
    { label: 'Email', value: String(data.email || '-') },
    { label: 'Telefon', value: String(data.phone || '-') },
    { label: 'Tárgy', value: String(data.subject || '-') },
  ])}
    ${paragraph(String(data.message || '-'))}
  `);
}

// ---- Format subsidy email (HTML) ----
function formatSubsidyHtml(data: Record<string, unknown>): string {
  return wrapHtml('Pályázat érdeklődés', `
    ${badge('🏠 Pályázat', '#fef3c7', '#92400e')}
    ${heading('Új pályázat érdeklődés!')}
    ${infoBox([
    { label: 'Név', value: String(data.name || '-') },
    { label: 'Telefon', value: String(data.phone || '-') },
    { label: 'Email', value: String(data.email || '-') },
    { label: 'Épület', value: String(data.buildingType || '-') },
    { label: 'Év', value: String(data.buildingYear || '-') },
    { label: 'Terület', value: `${data.area || '-'} m²` },
    { label: 'Fűtés', value: String(data.currentHeating || '-') },
  ])}
    ${data.plannedWork ? paragraph(`<strong>Tervezett munka:</strong> ${data.plannedWork}`) : ''}
    ${data.calculatorResult ? paragraph(`<strong>Kalkulátor eredmény:</strong> ${data.calculatorResult}`) : ''}
  `);
}

// ---- Format B2B email (HTML) ----
function formatB2BHtml(data: Record<string, unknown>): string {
  return wrapHtml('B2B ajánlatkérés', `
    ${badge('🏢 B2B Partner', '#ede9fe', '#5b21b6')}
    ${heading('Új B2B ajánlatkérés!')}
    ${infoBox([
    { label: 'Cégnév', value: String(data.companyName || '-') },
    { label: 'Kapcsolattartó', value: String(data.contactName || '-') },
    { label: 'Email', value: String(data.email || '-') },
    { label: 'Telefon', value: String(data.phone || '-') },
    { label: 'Projekt típus', value: String(data.projectType || '-') },
  ])}
    ${data.message ? paragraph(`<strong>Üzenet:</strong> ${data.message}`) : ''}
  `);
}

// ---- Format newsletter email (HTML) ----
function formatNewsletterHtml(data: Record<string, unknown>): string {
  return wrapHtml('Hírlevél feliratkozás', `
    ${badge('📰 Feliratkozás')}
    ${heading('Új hírlevél feliratkozás')}
    ${infoBox([
    { label: 'Email', value: String(data.email || '-') },
  ])}
  `);
}

// ---- Format partner application email (HTML) ----
function formatPartnerHtml(data: Record<string, unknown>): string {
  return wrapHtml('Partner jelentkezés', `
    ${badge('🤝 Új partner', '#d1fae5', '#065f46')}
    ${heading('Új partner jelentkezés!')}
    ${infoBox([
    { label: 'Név', value: String(data.teljesNev || '-') },
    { label: 'Email', value: String(data.email || '-') },
    { label: 'Telefon', value: String(data.telefon || '-') },
    { label: 'Szakterület', value: String(data.szakma || '-') },
    { label: 'Munkaterület', value: String(data.munkaterulet || '-') },
    { label: 'Tapasztalat', value: String(data.tapasztalat || '-') },
    { label: 'Kapacitás', value: String(data.kapacitas || '-') },
    { label: 'Vállalkozói forma', value: String(data.vallalkozoiForma || '-') },
    { label: 'Biztosítás', value: String(data.biztositas || '-') },
  ])}
    ${data.bemutatkozas ? paragraph(`<strong>Bemutatkozás:</strong> ${data.bemutatkozas}`) : ''}
  `);
}

// ---- Format new job dispatcher email (HTML) ----
function formatNewJobDispatcherHtml(data: Record<string, unknown>): string {
  const tradeLabel: Record<string, string> = {
    viz: 'Vízszerelés', villany: 'Villanyszerelés',
    futes: 'Fűtésszerelés', combined: 'Kombinált'
  };
  return wrapHtml('Új munka érkezett', `
    ${badge('Új munka', data.priority === 'critical' ? '#fef2f2' : '#dbeafe', data.priority === 'critical' ? '#991b1b' : '#1e40af')}
    ${heading('Új munka érkezett')}
    ${infoBox([
    { label: 'Azonosító', value: String(data.job_id || '-') },
    { label: 'Típus', value: tradeLabel[String(data.trade)] || String(data.trade || '-') },
    { label: 'Prioritás', value: String(data.priority || 'normal') },
    { label: 'Ügyfél', value: String(data.customer_name || '-') },
    { label: 'Telefon', value: String(data.phone || '-') },
    { label: 'Kerület', value: data.district ? `${data.district}. kerület` : '-' },
  ])}
    ${paragraph(`<strong>Cím:</strong> ${data.title || '-'}`)}
    ${data.description ? paragraph(String(data.description)) : ''}
    ${data.admin_panel_link ? button('Admin Panel', String(data.admin_panel_link)) : ''}
  `);
}

// ---- Format new contractor admin email (HTML) ----
function formatNewContractorAdminHtml(data: Record<string, unknown>): string {
  return wrapHtml('Új partner regisztráció', `
    ${badge('Új partner', '#fef3c7', '#92400e')}
    ${heading('Új partner regisztrált!')}
    ${infoBox([
    { label: 'Név', value: String(data.display_name || '-') },
    { label: 'Email', value: String(data.email || '-') },
    { label: 'Telefon', value: String(data.phone || '-') },
    { label: 'Szakterületek', value: String(data.trades || '-') },
    { label: 'Munkaterületek', value: String(data.service_areas || '-') },
  ])}
    ${data.review_link ? button('Jóváhagyás', String(data.review_link), '#059669') : paragraph('Az admin panelen tekintheti meg.')}
  `);
}

// ---- Format contractor welcome (HTML) ----
function formatContractorWelcomeHtml(data: Record<string, unknown>): string {
  const name = String(data.display_name || 'Partner');
  return wrapHtml('Sikeres regisztráció!', `
    ${badge('Regisztráció kész', '#d1fae5', '#065f46')}
    ${heading(`Üdvözlünk, ${name}!`)}
    ${paragraph('Regisztrációd sikeresen rögzítettük a VízVillanyFűtés rendszerben. Már csak egy lépés van hátra!')}
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:12px 16px;margin:10px 0;">
      <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:2px;">Jóváhagyásra vár</div>
      <div style="font-size:12px;color:#a16207;line-height:1.4;">A bejelentkezés az admin jóváhagyás után lesz lehetséges — általában <strong>24 órán belül</strong>.</div>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;margin:10px 0;">
      <div style="font-size:13px;font-weight:700;color:#1e40af;margin-bottom:2px;">Értesítünk</div>
      <div style="font-size:12px;color:#1d4ed8;line-height:1.4;">Jóváhagyás után automatikus e-mail értesítést küldünk.</div>
    </div>
    <div style="background:#f8fafc;border-radius:10px;padding:14px 16px;margin:10px 0;">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Következő lépések</div>
      <div style="font-size:12px;color:#334155;line-height:1.8;">
        1. Regisztráció kész<br>
        2. Admin jóváhagyás (max. 24 óra)<br>
        3. E-mail értesítés<br>
        4. Bejelentkezés és munkák fogadása
      </div>
    </div>
    ${button('Vissza a weboldalra', BASE_URL)}
  `);
}

// ---- Format customer welcome (HTML) ----
function formatCustomerWelcomeHtml(data: Record<string, unknown>): string {
  const name = String(data.display_name || 'Ügyfél');
  return wrapHtml('Sikeres regisztráció!', `
    ${badge('Fiók létrehozva', '#d1fae5', '#065f46')}
    ${heading(`Üdvözlünk, ${name}!`)}
    ${paragraph('Fiókod sikeresen létrejött! Mostantól bármikor bejelentkezhetsz és igényelheted szolgáltatásainkat.')}
    <div style="background:#ecfdf5;border:1px solid #86efac;border-radius:10px;padding:14px 16px;margin:10px 0;">
      <div style="font-size:14px;font-weight:700;color:#166534;margin-bottom:6px;text-align:center;">Mire használhatod a fiókod?</div>
      <div style="font-size:12px;color:#15803d;line-height:1.8;text-align:left;">
        Időpontfoglalás &nbsp; | &nbsp; Munkák követése<br>
        Közvetlen kapcsolat &nbsp; | &nbsp; Értékelések
      </div>
    </div>
    ${button('Bejelentkezés', `${BASE_URL}/login?role=customer`, '#059669')}
    <div style="text-align:center;margin-top:8px;">
      <span style="font-size:12px;color:#64748b;">Kérdésed van? <a href="mailto:info@vizvillanyfutes.hu" style="color:#0062B8;text-decoration:none;font-weight:600;">info@vizvillanyfutes.hu</a></span>
    </div>
  `);
}

// ---- Format contractor approved (HTML) ----
function formatContractorApprovedHtml(data: Record<string, unknown>): string {
  const name = String(data.display_name || 'Partner');
  const loginLink = String(data.login_link || `${BASE_URL}/login`);
  return wrapHtml('Fiókod jóváhagyva!', `
    ${badge('Jóváhagyva', '#d1fae5', '#065f46')}
    ${heading(`Fiókod jóváhagyva, ${name}!`)}
    ${paragraph('Örömmel értesítünk, hogy partner fiókod sikeresen jóváhagyásra került! Mostantól aktív vagy a rendszerben.')}
    <div style="background:#ecfdf5;border:1px solid #86efac;border-radius:10px;padding:14px 16px;margin:10px 0;text-align:center;">
      <div style="font-size:14px;font-weight:700;color:#166534;margin-bottom:4px;">Mostantól aktív vagy!</div>
      <div style="font-size:12px;color:#15803d;line-height:1.4;">Bejelentkezhetsz és fogadhatsz megbízásokat. Profilodat bármikor frissítheted.</div>
    </div>
    ${button('Bejelentkezés', loginLink, '#059669')}
    <div style="text-align:center;margin-top:8px;">
      <span style="font-size:12px;color:#64748b;">Kérdésed van? <a href="mailto:info@vizvillanyfutes.hu" style="color:#0062B8;text-decoration:none;font-weight:600;">info@vizvillanyfutes.hu</a></span>
    </div>
  `);
}

// ---- Format job assigned contractor (HTML) ----
function formatJobAssignedContractorHtml(data: Record<string, unknown>): string {
  const tradeLabel: Record<string, string> = {
    viz: 'Vízszerelés', villany: 'Villanyszerelés',
    futes: 'Fűtésszerelés', combined: 'Kombinált'
  };
  const priorityLabel = data.priority === 'critical' ? 'Sürgős' : data.priority === 'high' ? 'Magas' : 'Normál';
  return wrapHtml('Új munka megbízás', `
    ${badge('Új megbízás', '#dbeafe', '#1e40af')}
    ${heading('Új munka megbízás érkezett!')}
    ${paragraph('Kedves Partner! Új munka megbízás érkezett az Ön számára.')}
    ${infoBox([
    { label: 'Típus', value: tradeLabel[String(data.trade)] || String(data.trade || '-') },
    { label: 'Prioritás', value: String(data.priority || 'normal') },
    { label: 'Ügyfél', value: String(data.customer_name || '-') },
    { label: 'Cím', value: String(data.address_full || '-') },
  ])}
    ${paragraph(`<strong>${data.title || '-'}</strong>`)}
    ${data.description ? paragraph(String(data.description)) : ''}
    ${data.accept_decline_link ? button('Elfogadás / Elutasítás', String(data.accept_decline_link), '#059669') : button('Bejelentkezés', `${BASE_URL}/contractor/dashboard`)}
  `);
}

// ---- Format contractor suspended (HTML) ----
function formatContractorSuspendedHtml(data: Record<string, unknown>): string {
  return wrapHtml('Fiók felfüggesztve', `
    ${badge('Felfüggesztve', '#fef2f2', '#991b1b')}
    ${heading('Partner fiók felfüggesztve')}
    ${paragraph(`Kedves ${data.display_name || 'Partner'}, értesítjük, hogy partner fiókja ideiglenesen felfüggesztésre került.`)}
    ${infoBox([
    { label: 'Indok', value: String(data.reason || 'Nincs megadva') },
  ])}
    ${paragraph('Ha kérdése van, kérjük vegye fel velünk a kapcsolatot az <a href="mailto:info@vizvillanyfutes.hu" style="color:#0062B8;">info@vizvillanyfutes.hu</a> címen.')}
  `, { accentColor: '#dc2626' });
}

// ---- Format job declined admin (HTML) ----
function formatJobDeclinedAdminHtml(data: Record<string, unknown>): string {
  const tradeLabel: Record<string, string> = {
    viz: 'Vízszerelés', villany: 'Villanyszerelés',
    futes: 'Fűtésszerelés', combined: 'Kombinált'
  };
  return wrapHtml('Munka elutasítva', `
    ${badge('Újrakiosztás szükséges', '#fef3c7', '#92400e')}
    ${heading('Munka elutasítva')}
    ${infoBox([
    { label: 'Munka', value: String(data.job_title || '-') },
    { label: 'Típus', value: tradeLabel[String(data.trade)] || String(data.trade || '-') },
    { label: 'Elutasító', value: String(data.contractor_name || '-') },
    { label: 'Indok', value: String(data.decline_reason || 'Nincs megadva') },
  ])}
    ${paragraph('A munka újrakiosztásra vár. Kérjük rendelje hozzá egy másik szakemberhez.')}
    ${data.admin_link ? button('Admin Panel', String(data.admin_link)) : ''}
  `);
}

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://vizvillanyfutes.hu';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const clientIp = getClientIp(request);
    const { success: rateLimitOk } = rateLimit(`send-email:${clientIp}`, 5, 60 * 1000);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Túl sok kérés. Kérjük próbáld újra 1 perc múlva.' },
        { status: 429 }
      );
    }

    // Check content type to determine how to parse body
    const contentType = request.headers.get('content-type') || '';

    let type: string;
    let data: Record<string, any>;
    let attachments: { filename: string; content: Buffer }[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const typeEntry = formData.get('type');
      const dataEntry = formData.get('data');

      if (!typeEntry || !dataEntry) {
        return NextResponse.json({ error: 'Missing type or data fields' }, { status: 400 });
      }
      if (typeof typeEntry !== 'string' || typeof dataEntry !== 'string') {
        return NextResponse.json({ error: 'Type and data fields must be strings' }, { status: 400 });
      }

      type = typeEntry;
      try {
        data = JSON.parse(dataEntry);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON in data field' }, { status: 400 });
      }

      // Process files
      const fileEntries = formData.getAll('files');
      if (fileEntries && fileEntries.length > 0) {
        for (const entry of fileEntries) {
          if (!(entry instanceof File)) continue;
          if (entry.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: `File too large: ${entry.name} (Max 10MB)` }, { status: 400 });
          }
          const arrayBuffer = await entry.arrayBuffer();
          attachments.push({ filename: entry.name, content: Buffer.from(arrayBuffer) });
        }
      }
    } else {
      const body = await request.json();
      type = body.type;
      data = body.data;
    }

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    let subject = '';
    let htmlBody = '';
    let recipientEmail = process.env.EMAIL_TO || 'info@vizvillanyfutes.hu';

    switch (type) {
      case 'booking':
        subject = `🔧 Új időpontfoglalás: ${data.problem || 'Általános'}`;
        htmlBody = formatBookingHtml(data);
        break;
      case 'contact':
        subject = `✉️ Kapcsolat: ${data.subject || 'Általános'}`;
        htmlBody = formatContactHtml(data);
        break;
      case 'subsidy':
        subject = `🏠 Pályázat érdeklődés: ${data.name || 'Ismeretlen'}`;
        htmlBody = formatSubsidyHtml(data);
        break;
      case 'b2b':
        subject = `🏢 B2B ajánlatkérés: ${data.companyName || 'Ismeretlen cég'}`;
        htmlBody = formatB2BHtml(data);
        break;
      case 'newsletter':
        subject = `📰 Új hírlevél feliratkozás`;
        htmlBody = formatNewsletterHtml(data);
        break;
      case 'partner':
        subject = `🤝 Partner jelentkezés: ${data.teljesNev || 'Ismeretlen'} (${data.szakma || 'Általános'})`;
        htmlBody = formatPartnerHtml(data);
        break;
      case 'new_job_dispatcher':
        subject = `${data.priority === 'critical' ? '🚨 SÜRGŐS' : data.priority === 'high' ? '⚠️' : '📋'} Új munka: ${data.title || 'Általános'}`;
        htmlBody = formatNewJobDispatcherHtml(data);
        recipientEmail = process.env.DISPATCHER_EMAIL || process.env.EMAIL_TO || 'dispatcher@vizvillanyfutes.hu';
        break;
      case 'new_contractor_admin':
        subject = `👷 Új partner regisztráció: ${data.display_name || 'Ismeretlen'}`;
        htmlBody = formatNewContractorAdminHtml(data);
        recipientEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_TO || 'admin@vizvillanyfutes.hu';
        break;
      case 'new_contractor_welcome':
        subject = `Sikeres regisztráció – VízVillanyFűtés`;
        htmlBody = formatContractorWelcomeHtml(data);
        if (data.to_email && typeof data.to_email === 'string') recipientEmail = data.to_email;
        break;
      case 'contractor_approved':
        subject = `🎉 Fiókod jóváhagyva – VízVillanyFűtés`;
        htmlBody = formatContractorApprovedHtml(data);
        if (data.to_email && typeof data.to_email === 'string') recipientEmail = data.to_email;
        break;
      case 'customer_welcome':
        subject = `Sikeres regisztráció – VízVillanyFűtés`;
        htmlBody = formatCustomerWelcomeHtml(data);
        if (data.to_email && typeof data.to_email === 'string') recipientEmail = data.to_email;
        break;
      case 'job_assigned_contractor':
        subject = `${data.priority === 'critical' ? '🚨 SÜRGŐS' : '📋'} Új munka megbízás: ${data.title || 'Munka'}`;
        htmlBody = formatJobAssignedContractorHtml(data);
        recipientEmail = data.to_email as string || recipientEmail;
        break;
      case 'job_declined_admin':
        subject = `⚠️ Munka elutasítva – Újrakiosztás szükséges: ${data.job_title || 'Munka'}`;
        htmlBody = formatJobDeclinedAdminHtml(data);
        recipientEmail = data.to_email as string || process.env.ADMIN_EMAIL || process.env.DISPATCHER_EMAIL || recipientEmail;
        break;
      case 'contractor_suspended':
        subject = `⚠️ Partner fiók felfüggesztve – VízVillanyFűtés`;
        htmlBody = formatContractorSuspendedHtml(data);
        recipientEmail = data.to_email as string || recipientEmail;
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('='.repeat(50));
      console.log('⚠️  RESEND_API_KEY not set - logging email instead');
      console.log('TO:', recipientEmail, 'SUBJECT:', subject);
      console.log('='.repeat(50));
      return NextResponse.json({ success: true, message: 'Email logged (no API key)', dev_mode: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'VízVillanyFűtés <info@vizvillanyfutes.hu>',
      to: recipientEmail,
      replyTo: data.email as string || undefined,
      subject,
      html: htmlBody,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
    }

    console.log(`✅ Email sent successfully: ${subject}`);
    return NextResponse.json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
