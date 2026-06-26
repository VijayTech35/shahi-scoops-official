import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useDocumentTitle from '../hooks/useDocumentTitle'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'Account info: name, email, phone (optional), delivery addresses. Order info: items purchased, delivery address, notes, payment status. We do NOT store your card details — those are handled by Razorpay (PCI-DSS Level 1 certified).',
  },
  {
    title: '2. How We Use Your Information',
    body: 'To process and deliver your orders. To send order updates, delivery notifications, and receipts. To send you our newsletter (only if you opted in). To improve our products and service. We never sell your data.',
  },
  {
    title: '3. Cookies',
    body: 'Essential cookies: keep you logged in, remember your cart, enable checkout. Analytics cookies (optional): help us understand traffic patterns. You can decline non-essential cookies via the cookie banner.',
  },
  {
    title: '4. Data Storage & Security',
    body: 'Your data is stored in an encrypted SQLite database with WAL mode. Passwords are hashed with bcrypt (cost factor 12) and never stored in plain text. We use HTTPS in production and httpOnly secure cookies for authentication.',
  },
  {
    title: '5. Your Rights',
    body: 'You can: view and update your profile data, download your order history, delete your account (and all associated data) at any time. Email support@shahiscoops.com for data requests. We respond within 7 days.',
  },
  {
    title: '6. Third-Party Services',
    body: 'Razorpay (payment processing), Gmail SMTP (transactional emails), Unsplash (product photography), Google Analytics (anonymized traffic analytics — only if you accept analytics cookies). Each has its own privacy policy.',
  },
  {
    title: '7. Children',
    body: 'Our service is not directed to children under 13. We do not knowingly collect data from children. Accounts found to belong to children will be deleted.',
  },
  {
    title: '8. International Users',
    body: 'We are based in India and operate under Indian law (Information Technology Act, 2000; IT Rules, 2011; DPDP Act, 2023). By using our service, you consent to your data being processed in India.',
  },
  {
    title: '9. Changes to This Policy',
    body: 'We may update this policy. Material changes will be notified via email or a banner on the site. Continued use after changes means you accept the updated policy.',
  },
  {
    title: '10. Contact',
    body: 'Privacy questions: support@shahiscoops.com. Data Protection Officer: dpo@shahiscoops.com.',
  },
]

export default function PrivacyPage() {
  useDocumentTitle('Privacy Policy')
  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-choco/60 hover:text-choco text-sm mb-6 no-underline">
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="font-heading text-4xl md:text-5xl text-choco font-bold mb-3">Privacy Policy</h1>
        <p className="text-choco/50 text-sm mb-10">Last updated: June 2026</p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-heading text-xl text-choco font-bold mb-2">{s.title}</h2>
              <p className="text-choco/70 text-sm leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
