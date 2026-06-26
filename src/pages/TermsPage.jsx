import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useDocumentTitle from '../hooks/useDocumentTitle'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing and placing an order with Shahi Scoops ("we", "us", "our"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.',
  },
  {
    title: '2. Orders & Payment',
    body: 'All orders are subject to availability. Prices are listed in Indian Rupees (₹) and include applicable GST. Payment is processed via Razorpay. We reserve the right to refuse or cancel orders due to pricing errors, stock issues, or suspected fraud.',
  },
  {
    title: '3. Delivery',
    body: 'We deliver within Bengaluru city limits. Delivery times are estimates, not guarantees. Free delivery on orders above ₹300; otherwise ₹30 flat. Risk of loss passes to you upon delivery.',
  },
  {
    title: '4. Returns & Refunds',
    body: 'Due to the perishable nature of our products, we cannot accept returns. If your order arrives damaged, spoiled, or incorrect, contact us within 2 hours of delivery with a photo. We will replace or refund at our discretion.',
  },
  {
    title: '5. Allergen Information',
    body: 'Our products contain dairy, nuts, and other common allergens. Product ingredients are listed on each item. We are not responsible for allergic reactions. Please review ingredients carefully before ordering.',
  },
  {
    title: '6. Account Responsibilities',
    body: 'You are responsible for maintaining the security of your account and password. We are not liable for unauthorized access resulting from your failure to protect credentials. Notify us immediately of any breach.',
  },
  {
    title: '7. Loyalty Program',
    body: 'Earn 1 point per ₹10 spent. Points have no cash value and are non-transferable. We reserve the right to modify the program, expire inactive points, or revoke points obtained fraudulently.',
  },
  {
    title: '8. Intellectual Property',
    body: 'All content on this site — including the Shahi Scoops name, logo, product photos, recipes, and copy — is our property and protected by copyright. You may not reproduce without written permission.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'To the maximum extent permitted by law, our liability is limited to the amount you paid for the affected order. We are not liable for indirect, incidental, or consequential damages.',
  },
  {
    title: '10. Changes to Terms',
    body: 'We may update these terms at any time. Continued use of the service after changes constitutes acceptance. Material changes will be communicated via email or site notice.',
  },
  {
    title: '11. Contact',
    body: 'Questions? Email us at support@shahiscoops.com or WhatsApp +91 62043 73073.',
  },
]

export default function TermsPage() {
  useDocumentTitle('Terms of Service')
  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-choco/60 hover:text-choco text-sm mb-6 no-underline">
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="font-heading text-4xl md:text-5xl text-choco font-bold mb-3">Terms of Service</h1>
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
