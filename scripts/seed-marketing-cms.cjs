/**
 * Inserts initial marketing CMS documents from static page copy (create-only).
 * Run: dotenv -e .env.local -- node scripts/seed-marketing-cms.cjs
 *
 * Skips slugs that already exist so admin edits are preserved.
 * Requires at least one user with role EDITOR, ADMIN, or SUPERADMIN for authorId.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Wearo India";
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "Wearo.in";
const DOMAIN_LOWER = SITE_DOMAIN.toLowerCase();

function seeds() {
  return [
    {
      slug: "about",
      title: `About ${SITE_NAME}`,
      summary: "Fashion that fits your life — from casual weekdays to celebrations.",
      html: `<p class="text-lg leading-relaxed text-black/75">${SITE_NAME} is built for shoppers across India who want reliable quality, fair pricing, and styles they can wear with confidence — women, men, and kids.</p><p>We curate clothing and accessories with care: fabrics that feel good, fits that work in real life, and designs that stay wearable season after season. Our team works closely with trusted partners so you can shop once and come back knowing what to expect.</p><h2>Our promise</h2><ul><li>Transparent product information and clear sizing guidance where available.</li><li>Secure checkout with payment methods your store enables.</li><li>Support when you need it — see <a href="/support">Customer support</a>.</li></ul><p>Ready to browse? <a href="/shop">Explore the shop</a> or read how we ship in <a href="/delivery">Delivery details</a>.</p>`,
    },
    {
      slug: "features",
      title: "Features",
      summary: `Everything ${SITE_NAME} offers today — designed to make shopping simple and trustworthy.`,
      html: `<h2>Shopping</h2><p>Browse by category and style filters on the <a href="/shop">shop</a>, view rich product pages with imagery and pricing, and move through checkout with clear steps.</p><h2>Account &amp; orders</h2><p>Create an account to save your details and view orders in one place. Visit <a href="/account">Your account</a> after signing in to see history and confirmation references.</p><h2>Payments</h2><p>Pay using methods enabled for your market (cards, UPI, wallets, etc.). Details vary by store configuration — see <a href="/help/payments">Payments help</a>.</p><h2>Need help?</h2><p>Our <a href="/support">support</a> page lists how to reach us and typical response times.</p>`,
    },
    {
      slug: "works",
      title: "How it works",
      summary: "From discovering styles to receiving your order — here’s the journey.",
      html: `<h2>1. Browse &amp; choose</h2><p>Explore collections on the <a href="/shop">shop</a>, open products you like, and add them to your bag. Adjust sizes and quantities before checkout.</p><h2>2. Checkout securely</h2><p>Enter shipping details and pay with an available method. You’ll see confirmation on-screen and receive details by email where configured.</p><h2>3. We prepare &amp; ship</h2><p>Orders are processed and handed to our logistics partners. Timelines depend on your location — see <a href="/delivery">Delivery details</a>.</p><h2>4. Track &amp; enjoy</h2><p>Use your order confirmation and account area where available. Questions? <a href="/support">Contact support</a>.</p>`,
    },
    {
      slug: "careers",
      title: "Careers",
      summary: "We’re growing a thoughtful e-commerce experience for Indian shoppers.",
      html: `<p>${SITE_NAME} brings together merchandising, technology, and customer experience. We look for people who care about quality, clarity, and respect for shoppers’ time and money.</p><h2>Open roles</h2><p>We post openings as they become available. For general interest, reach out via <a href="/support">Customer support</a> with “Careers” in the subject and your focus area (operations, tech, design, or merchandising).</p><h2>What we value</h2><ul><li>Ownership and clear communication.</li><li>Customer empathy — especially when things go wrong.</li><li>Attention to detail in product and process.</li></ul>`,
    },
    {
      slug: "support",
      title: "Customer support",
      summary: `We’re here to help you shop confidently on ${SITE_NAME}.`,
      html: `<h2>Before you write in</h2><ul><li><a href="/help/orders">Orders</a> — confirmations, timelines, and changes.</li><li><a href="/delivery">Delivery</a> — shipping regions and tracking.</li><li><a href="/help/payments">Payments</a> — failed payments and receipts.</li></ul><h2>Contact</h2><p>Email is the primary channel for this storefront deployment. Use the contact address or form your team configures for production (e.g. support@${DOMAIN_LOWER}).</p><p class="rounded-xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/70"><strong class="text-black">Tip:</strong> Include your order ID or registered email so we can resolve issues faster.</p><h2>Response times</h2><p>We aim to reply within 1–2 business days. Peak sale periods may take a little longer — thank you for your patience.</p>`,
    },
    {
      slug: "delivery",
      title: "Delivery details",
      summary: "Where we ship, how long it usually takes, and how to follow your parcel.",
      html: `<h2>Coverage</h2><p>We ship to serviceable pin codes across India. Availability is confirmed at checkout based on your address and carrier capacity.</p><h2>Timelines</h2><p>Standard orders typically dispatch within 1–3 business days unless stated otherwise on the product page. Transit time depends on your city and courier — metro areas are often faster; remote locations may take longer.</p><h2>Fees</h2><p>Shipping charges (if any) appear clearly before you pay. Free-shipping promotions apply only when shown at checkout.</p><section id="tracking" class="scroll-mt-28"><h2>Manage deliveries &amp; tracking</h2><p>After checkout you receive a confirmation email with order reference. When your package ships, tracking information may be included where carriers support it.</p><p>Signed-in shoppers can review orders under <a href="/account">Your account</a>. You can also use the secure link from your confirmation email.</p></section><h2>Issues</h2><p>Wrong address, delayed parcel, or damaged package? <a href="/support">Contact support</a> with your order ID.</p>`,
    },
    {
      slug: "terms",
      title: "Terms & conditions",
      summary: "Please read these terms before using our website and placing orders.",
      html: `<p class="text-sm text-black/50">Last updated: 10 May 2026</p><h2>1. Agreement</h2><p>By accessing ${SITE_DOMAIN} (“Site”) or placing an order with ${SITE_NAME}, you agree to these Terms and our <a href="/privacy">Privacy policy</a>.</p><h2>2. Orders &amp; pricing</h2><p>Product descriptions and prices are shown in good faith; rare errors may occur. We reserve the right to cancel orders affected by manifest mistakes, stock issues, or suspected fraud, with a full refund where payment was captured.</p><h2>3. Payment</h2><p>Payments are processed through providers enabled for this store. You authorise charges for the total shown at checkout in the currency displayed.</p><h2>4. Shipping</h2><p>Delivery obligations follow our <a href="/delivery">Delivery details</a>. Risk of loss passes in line with carrier terms once goods leave our fulfilment partner unless applicable law says otherwise.</p><h2>5. Returns &amp; refunds</h2><p>Return eligibility depends on product category and campaign rules displayed at purchase. Contact <a href="/support">support</a> with your order ID for assistance.</p><h2>6. Limitation</h2><p>To the extent permitted by law, ${SITE_NAME} is not liable for indirect or consequential losses arising from use of the Site or delayed delivery due to events outside reasonable control.</p><h2>7. Contact</h2><p>Questions about these terms? Reach us via the channels on our <a href="/support">support</a> page.</p>`,
    },
    {
      slug: "privacy",
      title: "Privacy policy",
      summary: "Your privacy matters. This page summarises how we handle personal information.",
      html: `<p class="text-sm text-black/50">Last updated: 10 May 2026</p><h2>1. Who we are</h2><p>This policy applies to ${SITE_NAME} operating ${SITE_DOMAIN} (the “Site”).</p><h2>2. Data we collect</h2><ul><li><strong>Account &amp; orders:</strong> name, email, phone, shipping address, order history.</li><li><strong>Payments:</strong> processed by payment partners; we do not store full card numbers on our servers.</li><li><strong>Technical:</strong> cookies and similar technologies needed for sign-in, cart, and security (see your browser settings).</li></ul><h2>3. How we use data</h2><p>To fulfil orders, communicate about purchases, prevent fraud, and improve the Site.</p><h2>4. Sharing</h2><p>We share data with service providers (hosting, payments, shipping, email) strictly to operate the store. We may disclose information if required by law.</p><h2>5. Retention</h2><p>We keep order and account data as needed for legal, tax, and support purposes, then delete or anonymise where appropriate.</p><h2>6. Your choices</h2><p>You may request access or correction of personal data subject to applicable law. Start via <a href="/support">support</a>.</p><h2>7. Updates</h2><p>We may revise this policy; the “Last updated” date will change. Continued use after updates means you accept the revised policy where permitted.</p>`,
    },
    {
      slug: "help-orders",
      title: "Orders help",
      summary: "Everything about placing and managing orders.",
      html: `<h2>Confirmation</h2><p>After payment succeeds, you should receive an order confirmation by email. Keep that email — it contains references our team uses to help you.</p><h2>View orders online</h2><p>Sign in and open <a href="/account">Your account</a> to see orders linked to your profile when available.</p><h2>Changes &amp; cancellations</h2><p>Whether an order can be changed depends on fulfilment status. Contact <a href="/support">support</a> as early as possible with your order ID.</p><h2>Wrong item or quantity</h2><p>Tell us within the timeframe stated in your confirmation or campaign terms. Photos help us resolve issues faster.</p>`,
    },
    {
      slug: "help-payments",
      title: "Payments help",
      summary: "How checkout payments work and what to do when something fails.",
      html: `<h2>Methods</h2><p>Available options (cards, UPI, netbanking, wallets, etc.) appear at checkout based on your device, bank, and what the store has enabled.</p><h2>Security</h2><p>Sensitive card data is handled by certified payment partners; ${SITE_NAME} does not store full card numbers on our application servers.</p><h2>Failed or pending payments</h2><p>If money left your account but the order did not confirm, wait a few minutes for automatic reconciliation. If the issue persists, email <a href="/support">support</a> with time of attempt and payment reference from your bank or UPI app.</p><h2>Refunds</h2><p>Approved refunds return to the original payment method where possible; bank timelines vary.</p>`,
    },
    {
      slug: "resources",
      title: "Resources",
      summary: "Learn, browse deeper, and get inspired beyond the catalogue.",
      html: `<ul class="list-none space-y-4 pl-0"><li class="rounded-xl border border-black/10 bg-black/[0.02] p-5"><a href="/resources/ebooks" class="no-underline hover:no-underline"><span class="block text-lg font-semibold text-black">Free eBooks &amp; guides</span><span class="mt-1 block text-sm font-normal text-black/60">PDFs and seasonal lookbooks.</span></a></li><li class="rounded-xl border border-black/10 bg-black/[0.02] p-5"><a href="/resources/tutorials" class="no-underline hover:no-underline"><span class="block text-lg font-semibold text-black">Tutorials</span><span class="mt-1 block text-sm font-normal text-black/60">Step-by-step tips for shopping and care.</span></a></li><li class="rounded-xl border border-black/10 bg-black/[0.02] p-5"><a href="/resources/blog" class="no-underline hover:no-underline"><span class="block text-lg font-semibold text-black">Blog</span><span class="mt-1 block text-sm font-normal text-black/60">Stories, trends, and how-tos.</span></a></li></ul>`,
    },
    {
      slug: "resources-ebooks",
      title: "Free eBooks & guides",
      summary: "Curated PDFs and seasonal guides — add your own files as your content programme grows.",
      html: `<p class="text-lg leading-relaxed text-black/75">We’re assembling bite-sized guides — capsule wardrobes, fabric care, and fit basics — for ${SITE_NAME} shoppers.</p><p>New downloads will appear here first. Until then, explore styling ideas on our <a href="/resources/blog">blog</a> and video picks linked from the footer.</p>`,
    },
    {
      slug: "resources-tutorials",
      title: "Tutorials",
      summary: "Practical walkthroughs — from choosing a size to caring for fabrics.",
      html: `<h2>Shopping smarter</h2><ul><li>Use filters on the shop to narrow by category and style.</li><li>Read fabric notes on product pages before you buy.</li><li>Save your shipping details in <a href="/account">your account</a> for faster checkout.</li></ul><h2>Caring for your clothes</h2><p>Follow wash labels, separate colours for the first wash, and air-dry delicate knits where recommended.</p><p>More articles will live under our <a href="/resources/blog">blog</a> as we publish.</p>`,
    },
    {
      slug: "resources-blog",
      title: "Blog",
      summary: "Stories from our team — launches, fabric notes, and seasonal edits.",
      html: `<p>We’ll publish posts here as your content pipeline grows. For now, explore <a href="/shop">new arrivals</a>, <a href="/delivery">delivery</a>, and <a href="/support">support</a> for shopping questions.</p><p class="rounded-xl border border-dashed border-black/15 bg-black/[0.02] p-6 text-center text-black/60">No articles yet — connect a CMS or markdown workflow when you’re ready to scale ${SITE_NAME} editorial.</p>`,
    },
  ];
}

async function main() {
  const author = await prisma.user.findFirst({
    where: { role: { in: ["EDITOR", "ADMIN", "SUPERADMIN"] } },
    select: { id: true },
  });

  if (!author) {
    console.error("No EDITOR/ADMIN/SUPERADMIN user found. Create an admin user first.");
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const row of seeds()) {
    const existing = await prisma.cmsDocument.findUnique({ where: { slug: row.slug } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.cmsDocument.create({
      data: {
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        content: row.html,
        type: "PAGE",
        published: true,
        publishedAt: new Date(),
        authorId: author.id,
      },
    });
    created++;
    console.log("Created CMS:", row.slug);
  }

  console.log(`Done. Created ${created}, skipped ${skipped} (already existed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
