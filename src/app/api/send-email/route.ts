import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Format booking email
function formatBookingEmail(data: Record<string, unknown>): string {
  return `
ÚJ IDŐPONTFOGLALÁS

=== PROBLÉMA ===
Kategória: ${data.category || '-'}
Probléma típusa: ${data.problem || '-'}
Leírás: ${data.description || '-'}
Helyiség: ${data.room || '-'}
SOS: ${data.isSOS ? 'IGEN' : 'Nem'}
Expressz: ${data.isExpress ? 'IGEN' : 'Nem'}
Kisgyerek: ${data.hasChildren ? 'Igen' : 'Nem'}
Idős személy: ${data.hasElderly ? 'Igen' : 'Nem'}

=== IDŐPONT ===
Dátum: ${data.selectedDate || '-'}
Időpont: ${data.selectedTime || '-'}

=== ÜGYFÉL ADATOK ===
Név: ${data.name || '-'}
Telefon: ${data.phone || '-'}
Email: ${data.email || '-'}

=== CÍM ===
Város: ${data.city || '-'}
Kerület: ${data.district || '-'}. kerület
Cím: ${data.address || '-'}
Emelet: ${data.floor || '-'}
Csengő: ${data.doorbell || '-'}
Bejutás: ${data.accessNote || '-'}

=== SZÁMLÁZÁS ===
Céges: ${data.isCompany ? 'Igen' : 'Nem'}
${data.isCompany ? `Cégnév: ${data.companyName || '-'}` : ''}
${data.isCompany ? `Adószám: ${data.taxNumber || '-'}` : ''}

=== EGYÉB ===
Becsült ár: ${data.estimatedPrice || '-'}
Marketing hozzájárulás: ${data.acceptMarketing ? 'Igen' : 'Nem'}

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format contact email
function formatContactEmail(data: Record<string, unknown>): string {
  return `
ÚJ KAPCSOLAT ÜZENET

Név: ${data.name || '-'}
Email: ${data.email || '-'}
Telefon: ${data.phone || '-'}
Tárgy: ${data.subject || '-'}

Üzenet:
${data.message || '-'}

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format subsidy calculator email
function formatSubsidyEmail(data: Record<string, unknown>): string {
  return `
ÚJ PÁLYÁZAT ÉRDEKLŐDÉS

=== ÜGYFÉL ===
Név: ${data.name || '-'}
Telefon: ${data.phone || '-'}
Email: ${data.email || '-'}

=== ÉPÜLET ADATOK ===
Épület típusa: ${data.buildingType || '-'}
Építés éve: ${data.buildingYear || '-'}
Alapterület: ${data.area || '-'} m²
Jelenlegi fűtés: ${data.currentHeating || '-'}

=== TERVEZETT MUNKA ===
${data.plannedWork || '-'}

=== KALKULÁTOR EREDMÉNY ===
${data.calculatorResult || '-'}

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format B2B partner email
function formatB2BEmail(data: Record<string, unknown>): string {
  return `
ÚJ B2B PARTNER AJÁNLATKÉRÉS

=== CÉG ADATOK ===
Cégnév: ${data.companyName || '-'}
Kapcsolattartó: ${data.contactName || '-'}
Email: ${data.email || '-'}
Telefon: ${data.phone || '-'}

=== PROJEKT ===
Projekt típusa: ${data.projectType || '-'}

Leírás:
${data.message || '-'}

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format newsletter signup email
function formatNewsletterEmail(data: Record<string, unknown>): string {
  return `
ÚJ HÍRLEVÉL FELIRATKOZÁS

Email: ${data.email || '-'}

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format partner application email
function formatPartnerEmail(data: Record<string, unknown>): string {
  return `
🤝 ÚJ PARTNER JELENTKEZÉS

=== ALAPADATOK ===
Név: ${data.teljesNev || '-'}
Email: ${data.email || '-'}
Telefon: ${data.telefon || '-'}

=== SZAKMAI PROFIL ===
Szakterület: ${data.szakma || '-'}
Munkaterület: ${data.munkaterulet || '-'}
Tapasztalat: ${data.tapasztalat || '-'}
Heti kapacitás: ${data.kapacitas || '-'}

=== VÁLLALKOZÁS ===
Vállalkozói forma: ${data.vallalkozoiForma || '-'}
Felelősségbiztosítás: ${data.biztositas || '-'}

=== BEMUTATKOZÁS ===
${data.bemutatkozas || '-'}

=== OPCIONÁLIS ===
Weboldal/profil: ${data.weboldal || '-'}
Megjegyzés: ${data.megjegyzes || '-'}

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format new job notification for dispatcher
function formatNewJobDispatcherEmail(data: Record<string, unknown>): string {
  const priorityEmoji = data.priority === 'critical' ? '🚨' : data.priority === 'high' ? '⚠️' : '📋';
  const categoryLabel = data.category === 'sos' ? 'SOS - SÜRGŐS' : data.category === 'b2b_project' ? 'B2B Projekt' : 'Standard';
  const tradeLabel = {
    'viz': 'Vízszerelés',
    'villany': 'Villanyszerelés',
    'futes': 'Fűtésszerelés',
    'combined': 'Kombinált'
  }[data.trade as string] || data.trade;

  return `
${priorityEmoji} ÚJ MUNKA ÉRKEZETT

=== MUNKA ADATOK ===
Azonosító: ${data.job_id || '-'}
Típus: ${tradeLabel || '-'}
Kategória: ${categoryLabel}
Prioritás: ${data.priority || 'normal'}

=== ÜGYFÉL ===
Név: ${data.customer_name || '-'}
Telefon: ${data.phone || '-'}
Kerület: ${data.district ? `${data.district}. kerület` : '-'}

=== PROBLÉMA ===
Cím: ${data.title || '-'}
Leírás: ${data.description || '-'}

=== ADMIN PANEL ===
${data.admin_panel_link || 'Link nem elérhető'}

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format new contractor notification for admin
function formatNewContractorAdminEmail(data: Record<string, unknown>): string {
  return `
👷 ÚJ PARTNER REGISZTRÁCIÓ

=== PARTNER ADATOK ===
Azonosító: ${data.contractor_profile_id || '-'}
Név: ${data.display_name || '-'}
Email: ${data.email || '-'}
Telefon: ${data.phone || '-'}

=== SZAKMAI PROFIL ===
Szakterületek: ${data.trades || '-'}
Munkaterületek: ${data.service_areas || '-'}

=== JÓVÁHAGYÁS ===
${data.review_link || 'Az admin panelen tekintheti meg'}

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format contractor approval notification
function formatContractorApprovedEmail(data: Record<string, unknown>): string {
  return `
✅ PARTNER FIÓK JÓVÁHAGYVA

Kedves ${data.display_name || 'Partner'}!

Örömmel értesítjük, hogy partner fiókja jóváhagyásra került!

Mostantól bejelentkezhet a rendszerbe és fogadhat munka megbízásokat.

Bejelentkezés: ${data.login_link || 'https://vizvillanyfutes.hu/login'}

Üdvözlettel,
VízVillanyFűtés csapata

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format job assignment notification for contractor
function formatJobAssignedContractorEmail(data: Record<string, unknown>): string {
  const priorityEmoji = data.priority === 'critical' ? '🚨' : data.priority === 'high' ? '⚠️' : '📋';
  const categoryLabel = data.category === 'sos' ? 'SOS - SÜRGŐS' : data.category === 'b2b_project' ? 'B2B Projekt' : 'Standard';
  const tradeLabel = {
    'viz': 'Vízszerelés',
    'villany': 'Villanyszerelés',
    'futes': 'Fűtésszerelés',
    'combined': 'Kombinált'
  }[data.trade as string] || data.trade;

  return `
${priorityEmoji} ÚJ MUNKA MEGBÍZÁS

Kedves Partner!

Új munka megbízás érkezett az Ön számára.

=== MUNKA ADATOK ===
Azonosító: ${data.job_id || '-'}
Típus: ${tradeLabel || '-'}
Kategória: ${categoryLabel}
Prioritás: ${data.priority || 'normal'}

=== ÜGYFÉL ===
Név: ${data.customer_name || '-'}
Cím: ${data.address_full || '-'}

=== IDŐPONT ===
Preferált időszak: ${data.preferred_time_from ? new Date(data.preferred_time_from as string).toLocaleString('hu-HU') : '-'} - ${data.preferred_time_to ? new Date(data.preferred_time_to as string).toLocaleString('hu-HU') : '-'}
Javasolt kezdés: ${data.proposed_start_time ? new Date(data.proposed_start_time as string).toLocaleString('hu-HU') : '-'}

=== LEÍRÁS ===
${data.title || '-'}
${data.description || '-'}

=== ELFOGADÁS / ELUTASÍTÁS ===
${data.accept_decline_link || 'Kérjük jelentkezzen be a rendszerbe a válaszadáshoz.'}

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format contractor suspended notification
function formatContractorSuspendedEmail(data: Record<string, unknown>): string {
  return `
⚠️ PARTNER FIÓK FELFÜGGESZTVE

Kedves ${data.display_name || 'Partner'}!

Értesítjük, hogy partner fiókja ideiglenesen felfüggesztésre került.

Indok: ${data.reason || 'Nincs megadva'}

Ha kérdése van, kérjük vegye fel velünk a kapcsolatot.

Üdvözlettel,
VízVillanyFűtés csapata

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

// Format job declined notification for admin
function formatJobDeclinedAdminEmail(data: Record<string, unknown>): string {
  const priorityEmoji = data.priority === 'critical' ? '🚨' : data.priority === 'high' ? '⚠️' : '📋';
  const tradeLabel = {
    'viz': 'Vízszerelés',
    'villany': 'Villanyszerelés',
    'futes': 'Fűtésszerelés',
    'combined': 'Kombinált'
  }[data.trade as string] || data.trade;

  return `
${priorityEmoji} MUNKA ELUTASÍTVA - ÚJRAKIOSZTÁS SZÜKSÉGES

=== MUNKA ===
Azonosító: ${data.job_id || '-'}
Cím: ${data.job_title || '-'}
Típus: ${tradeLabel || '-'}
Prioritás: ${data.priority || 'normal'}

=== ELUTASÍTÓ SZAKEMBER ===
Név: ${data.contractor_name || '-'}
Indok: ${data.decline_reason || 'Nincs megadva'}

=== TEENDŐ ===
A munka újrakiosztásra vár. Kérjük rendelje hozzá egy másik szakemberhez.

${data.admin_link || 'Lépjen be az admin panelre'}

---
Küldve: ${new Date().toLocaleString('hu-HU')}
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
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
        return NextResponse.json(
          { error: 'Missing type or data fields' },
          { status: 400 }
        );
      }

      if (typeof typeEntry !== 'string' || typeof dataEntry !== 'string') {
        return NextResponse.json(
          { error: 'Type and data fields must be strings' },
          { status: 400 }
        );
      }

      type = typeEntry;
      const dataStr = dataEntry;

      try {
        data = JSON.parse(dataStr);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON in data field' },
          { status: 400 }
        );
      }

      // Process files
      const fileEntries = formData.getAll('files');
      if (fileEntries && fileEntries.length > 0) {
        for (const entry of fileEntries) {
          if (!(entry instanceof File)) {
            continue; // Skip non-file entries
          }
          const file = entry;

          // Validate file size (10MB limit)
          if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
              { error: `File too large: ${file.name} (Max 10MB)` },
              { status: 400 }
            );
          }

          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          attachments.push({
            filename: file.name,
            content: buffer,
          });
        }
      }
    } else {
      // Fallback to JSON for other requests
      const body = await request.json();
      type = body.type;
      data = body.data;
    }

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing type or data' },
        { status: 400 }
      );
    }

    let subject = '';
    let emailBody = '';

    // Set custom recipient if provided
    let recipientEmail = process.env.EMAIL_TO || 'info@vizvillanyfutes.hu';

    switch (type) {
      case 'booking':
        subject = `🔧 Új időpontfoglalás: ${data.problem || 'Általános'}`;
        emailBody = formatBookingEmail(data);
        break;

      case 'contact':
        subject = `✉️ Kapcsolat: ${data.subject || 'Általános'}`;
        emailBody = formatContactEmail(data);
        break;
      case 'subsidy':
        subject = `🏠 Pályázat érdeklődés: ${data.name || 'Ismeretlen'}`;
        emailBody = formatSubsidyEmail(data);
        break;
      case 'b2b':
        subject = `🏢 B2B ajánlatkérés: ${data.companyName || 'Ismeretlen cég'}`;
        emailBody = formatB2BEmail(data);
        break;
      case 'newsletter':
        subject = `📰 Új hírlevél feliratkozás`;
        emailBody = formatNewsletterEmail(data);
        break;
      case 'partner':
        subject = `🤝 Partner jelentkezés: ${data.teljesNev || 'Ismeretlen'} (${data.szakma || 'Általános'})`;
        emailBody = formatPartnerEmail(data);
        break;
      // New backend email types
      case 'new_job_dispatcher':
        subject = `${data.priority === 'critical' ? '🚨 SÜRGŐS' : data.priority === 'high' ? '⚠️' : '📋'} Új munka: ${data.title || 'Általános'}`;
        emailBody = formatNewJobDispatcherEmail(data);
        recipientEmail = process.env.DISPATCHER_EMAIL || process.env.EMAIL_TO || 'dispatcher@vizvillanyfutes.hu';
        break;
      case 'new_contractor_admin':
        subject = `👷 Új partner regisztráció: ${data.display_name || 'Ismeretlen'}`;
        emailBody = formatNewContractorAdminEmail(data);
        recipientEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_TO || 'admin@vizvillanyfutes.hu';
        break;
      case 'contractor_approved':
        subject = `✅ Partner fiókja jóváhagyva - VízVillanyFűtés`;
        emailBody = formatContractorApprovedEmail(data);
        recipientEmail = data.to_email as string || recipientEmail;
        break;
      case 'job_assigned_contractor':
        subject = `${data.priority === 'critical' ? '🚨 SÜRGŐS' : '📋'} Új munka megbízás: ${data.title || 'Munka'}`;
        emailBody = formatJobAssignedContractorEmail(data);
        recipientEmail = data.to_email as string || recipientEmail;
        break;
      case 'job_declined_admin':
        subject = `⚠️ Munka elutasítva - Újrakiosztás szükséges: ${data.job_title || 'Munka'}`;
        emailBody = formatJobDeclinedAdminEmail(data);
        recipientEmail = data.to_email as string || process.env.ADMIN_EMAIL || process.env.DISPATCHER_EMAIL || recipientEmail;
        break;
      case 'contractor_suspended':
        subject = `⚠️ Partner fiók felfüggesztve - VízVillanyFűtés`;
        emailBody = formatContractorSuspendedEmail(data);
        recipientEmail = data.to_email as string || recipientEmail;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('='.repeat(50));
      console.log('⚠️  RESEND_API_KEY not set - logging email instead');
      console.log('SUBJECT:', subject);
      console.log('BODY:', emailBody);
      if (attachments.length > 0) {
        console.log(`📎 ATTACHMENTS: ${attachments.length} file(s)`);
        attachments.forEach(att => console.log(`   - ${att.filename} (${att.content.length} bytes)`));
      }
      console.log('='.repeat(50));

      return NextResponse.json({
        success: true,
        message: 'Email logged (no API key)',
        dev_mode: true,
      });
    }

    // Initialize Resend inside the function (for serverless compatibility)
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: 'VízVillanyFűtés <info@vizvillanyfutes.hu>',
      to: recipientEmail,
      replyTo: data.email as string || undefined,
      subject,
      text: emailBody,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Email sent successfully: ${subject}`);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
