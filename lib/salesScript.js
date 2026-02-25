/**
 * Sales scripts for leads (English & Telugu).
 * Structured by conversation flow. [NAME] = lead name.
 */

export const SCRIPT_SECTIONS_EN = [
  {
    title: 'Opening (intro)',
    body: `Hi [NAME], good morning/afternoon. I'm calling from Prisbo Services. We help local businesses like yours get a simple website or online card at very low cost — so customers can find you on Google and WhatsApp. Do you have two minutes?`,
  },
  {
    title: 'If they say YES (interested)',
    body: `Great. So we have a few options depending on what you need:

• Digital Visiting Card — from ₹199 one-time. Your name, photo, phone, WhatsApp, address. Customers scan a QR or open a link. Very popular with shop owners, agents.

• Small website — your business name on our domain, e.g. yourname.prisboservices.com. Starts ₹499 for a single page, goes up to ₹3,999 if you want more pages and you update it yourself.

• Portfolio (for individuals) — from ₹299. For freshers, photographers, tutors — one page with your work and contact.

• WhatsApp catalogue — from ₹999. List your products with photos; customers order via WhatsApp.

Which one sounds closest to what you need — card, website, or catalogue?`,
  },
  {
    title: 'If they say NO (not interested)',
    body: `No problem, [NAME]. Many people say the same till they see how little it costs — like the ₹199 digital card, one-time. No monthly fee. Whenever you feel you want to try it, just save this number and WhatsApp "website" or "card" — we'll send you a sample link. Have a good day.`,
  },
  {
    title: 'If they say "I\'ll think" / "Call later"',
    body: `Sure, no rush. What I can do right now is send you a sample link on WhatsApp — you can see how it looks in 10 seconds. No commitment. If you like it, we can take it from there. Should I send the sample to this number?`,
  },
  {
    title: 'If price objection ("too costly")',
    body: `I understand. That’s why we start really small — the Digital Visiting Card is just ₹199 one-time. No monthly. You get a link and a QR code: name, photo, phone, WhatsApp. So customers can find you without spending thousands. Once you see the value, we can look at a bigger site if you want. Want me to send you a sample of the ₹199 card?`,
  },
  {
    title: 'Close & CTA',
    body: `Perfect. I’ll WhatsApp you a sample link to this number. You check it and tell me what you think. For custom or bigger requirements we do a personalised quote. Our number: +91 78938 98201. You can call or WhatsApp anytime. Thank you, [NAME].`,
  },
];

export const SCRIPT_SECTIONS_TE = [
  {
    title: 'Opening (intro)',
    body: `నమస్కారం [NAME], గుడ్ మార్నింగ్/ఆఫ్టర్నూన్. నేను ప్రిస్బో సర్వీసెస్ నుండి కాల్ చేస్తున్నాను. మీ లాంటి లోకల్ బిజినెస్ వారికి చాలా తక్కువ ఖర్చుతో సాధారణ వెబ్‌సైట్ లేదా ఆన్లైన్ కార్డ్ ఇస్తాం — కస్టమర్స్ మిమ్మల్ని గూగుల్, వాట్సాప్ లో సులభంగా కనుక్కోవచ్చు. రెండు నిమిషాలు సమయం ఉందా?`,
  },
  {
    title: 'అవును అంటే (ఇష్టం ఉంటే)',
    body: `సరే. మీకు ఏం కావాలో బట్టి మాకు కొన్ని ఎంపికలు ఉన్నాయి:

• డిజిటల్ విజిటింగ్ కార్డ్ — ₹199 నుండి ఒకసారి. మీ పేరు, ఫోటో, ఫోన్, వాట్సాప్, అడ్రస్. కస్టమర్స్ QR స్కాన్ చేస్తే లేదా లింక్ తెరిచ్తే చూస్తారు. షాప్ ఓనర్స్, ఏజెంట్స్ కోసం చాలా పాపులర్.

• చిన్న వెబ్‌సైట్ — మా డొమైన్ పై మీ బిజినెస్ పేరు, ఉదా. yourname.prisboservices.com. ఒక పేజీకి ₹499 నుండి, ఎక్కువ పేజీలు మీరే అప్‌డేట్ చేయాలంటే ₹3,999 వరకు.

• పోర్ట్‌ఫోలియో (వ్యక్తులకు) — ₹299 నుండి. ఫ్రెషర్స్, ఫోటోగ్రాఫర్స్, ట్యూటర్స్ — మీ వర్క్, కాంటాక్ట్ ఉండే ఒక పేజీ.

• వాట్సాప్ కాటలాగ్ — ₹999 నుండి. ప్రాడక్ట్స్ ఫోటోలతో లిస్ట్ చేయండి; కస్టమర్స్ వాట్సాప్ ద్వారా ఆర్డర్ చేస్తారు.

మీకు దగ్గరగా ఏది అనిపిస్తోంది — కార్డ్, వెబ్‌సైట్ లేదా కాటలాగ్?`,
  },
  {
    title: 'కాదు అంటే (ఇష్టం లేదు)',
    body: `ప్రాబ్లమ్ లేదు [NAME]. ఎంత తక్కువ ఖర్చు అని చూసేవరకు అనేకమంది అలాగే అంటారు — ₹199 డిజిటల్ కార్డ్ లాగ, ఒకసారి. నెలవారీ లేదు. ఎప్పుడైనా ట్రై చేయాలనుకుంటే ఈ నంబర్ సేవ్ చేసుకుని "website" లేదా "card" అని వాట్సాప్ చేయండి — సాంపిల్ లింక్ పంపిస్తాం. శుభమస్తే.`,
  },
  {
    title: '"ఆలోచిస్తాను" / "తర్వాత కాల్ చేస్తాను" అంటే',
    body: `సరే, తొందర్లేదు. నేను ఇప్పుడే చేయగలిగేది — మీకు వాట్సాప్ లో ఒక సాంపిల్ లింక్ పంపిస్తాను. 10 సెకన్లలో ఎలా ఉంటుంది చూస్తారు. కమిట్‌మెంట్ లేదు. నచ్చితే అక్కడినుండి ముందుకు వెళ్తాం. ఈ నంబర్ కు సాంపిల్ పంపించనా?`,
  },
  {
    title: 'ధర ఎక్కువ అని అంటే',
    body: `అర్థమయ్యింది. అందుకే మేము చాలా చిన్నది నుండి మొదలు పెడతాం — డిజిటల్ విజిటింగ్ కార్డ్ ₹199 మాత్రమే, ఒకసారి. నెలవారీ లేదు. మీకు లింక్, QR కోడ్ వస్తుంది: పేరు, ఫోటో, ఫోన్, వాట్సాప్. అయివేలు ఖర్చు చేయకుండా కస్టమర్స్ మిమ్మల్ని కనుక్కోవచ్చు. వెల్యూ చూసిన తర్వాత కావాలంటే పెద్ద సైట్ చూసుకోవచ్చు. ₹199 కార్డ్ సాంపిల్ పంపించనా?`,
  },
  {
    title: 'క్లోజ్ & CTA',
    body: `పర్ఫెక్ట్. ఈ నంబర్ కు సాంపిల్ లింక్ వాట్సాప్ చేస్తాను. మీరు చూసి చెప్పండి. కస్టమ్ లేదా పెద్ద రిక్వైర్‌మెంట్స్ కోసం పర్సనలైజ్డ్ కోట్ ఇస్తాం. మా నంబర్: +91 78938 98201. ఎప్పుడైనా కాల్ లేదా వాట్సాప్ చేయండి. ధన్యవాదాలు [NAME].`,
  },
];

// Flat script for copy (EN)
export const SALES_SCRIPT_EN = SCRIPT_SECTIONS_EN.map((s) => `** ${s.title} **\n\n${s.body}`).join('\n\n---\n\n');

// Flat script for copy (TE)
export const SALES_SCRIPT_TE = SCRIPT_SECTIONS_TE.map((s) => `** ${s.title} **\n\n${s.body}`).join('\n\n---\n\n');

export function getScriptForLead(script, leadName = '') {
  const name = (leadName || '').trim() || 'there';
  return script.replace(/\[NAME\]/g, name);
}

export function getSectionsWithName(sections, leadName = '') {
  const name = (leadName || '').trim() || 'there';
  return sections.map((s) => ({
    title: s.title,
    body: s.body.replace(/\[NAME\]/g, name),
  }));
}

const CTA_LINE = 'Need something beyond this? For full custom products, advanced features, or enterprise solutions — contact us for a personalised quote: +91 78938 98201';

/** Detailed pricing for script area — each product is collapsible */
export const PRICING_PRODUCTS = [
  {
    id: 'subdomain',
    title: '🌐 Subdomain Website Model',
    subtitle: 'e.g. clientname.prisboservices.com',
    rows: [
      { tier: 'Basic', what: '1-page landing (name, photo, contact, WhatsApp button)', price: '₹499' },
      { tier: 'Starter', what: '3–4 pages (Home, About, Services, Contact)', price: '₹999' },
      { tier: 'Standard', what: '5–6 pages + contact form + Google Maps', price: '₹1,499' },
      { tier: 'Pro', what: '+ shared database (inquiry storage, product list)', price: '₹2,499' },
      { tier: 'Business', what: '+ basic admin panel to update content themselves', price: '₹3,999' },
    ],
    bestFor: 'Best for: Local shops, tailors, salons, tutors, small services',
    cta: CTA_LINE,
  },
  {
    id: 'portfolio',
    title: '📁 Portfolio-as-a-Service',
    subtitle: null,
    rows: [
      { tier: 'Basic Portfolio', what: '1 page, photo, bio, links', price: '₹299' },
      { tier: 'Full Portfolio', what: 'Projects section, resume download, contact', price: '₹799' },
      { tier: 'Pro Portfolio', what: 'Custom subdomain + shareable link + form', price: '₹1,299' },
    ],
    bestFor: 'Best for: Freshers, designers, developers, photographers, college students',
    cta: CTA_LINE,
  },
  {
    id: 'visiting-card',
    title: '🏪 Digital Visiting Card',
    subtitle: null,
    rows: [
      { tier: 'Basic', what: 'Name, photo, phone, WhatsApp, social links', price: '₹199' },
      { tier: 'Standard', what: '+ short bio, services list, location', price: '₹399' },
      { tier: 'Premium', what: '+ inquiry form, QR code printable', price: '₹699' },
    ],
    bestFor: 'Why fast: Every shopkeeper, agent, contractor wants this. Low price = easy yes.',
    cta: CTA_LINE,
  },
  {
    id: 'rent-a-site',
    title: '🗓️ Monthly Subscription / Rent-a-Site',
    subtitle: null,
    rows: [
      { tier: 'Basic', what: 'Subdomain site, hosted by you', price: '₹199/month' },
      { tier: 'Standard', what: '+ form submissions emailed to them', price: '₹399/month' },
      { tier: 'Pro', what: '+ monthly content update (1 change/month)', price: '₹699/month' },
    ],
    bestFor: 'Why powerful: 50 clients × ₹300/month = ₹15,000 recurring with zero extra work.',
    cta: CTA_LINE,
  },
  {
    id: 'whatsapp-catalogue',
    title: '🔌 WhatsApp Catalogue Site',
    subtitle: null,
    rows: [
      { tier: 'Starter', what: '10 products listed, WhatsApp order button', price: '₹999' },
      { tier: 'Standard', what: '25 products + categories', price: '₹1,999' },
      { tier: 'Pro', what: 'Shared DB, searchable catalogue, enquiry form', price: '₹3,499' },
    ],
    bestFor: null,
    cta: CTA_LINE,
  },
];
