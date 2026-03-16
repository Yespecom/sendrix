'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Printer, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type InvoiceData = {
  invoice: {
    number: string
    date: string
    dueDate: string | null
    status: string
    period: string | null
  }
  customer: {
    name: string
    email: string
  }
  plan: {
    key: string
    label: string
    foundingMember: boolean
    billingCycle: string
    description: string
  }
  pricing: {
    subtotal: number
    cgst: number
    sgst: number
    total: number
    amountPaid: number
    balanceDue: number
    currency: string
  }
  payment: {
    method: string
    transactionId: string | null
    date: string | null
  }
}

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function InvoicePage() {
  const [data, setData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [printing, setPrinting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/invoice')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [])

  const handlePrint = () => {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 100)
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !data) return
    setDownloading(true)
    try {
      const element = invoiceRef.current
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4'
      })
      
      const width = pdf.internal.pageSize.getWidth()
      const height = pdf.internal.pageSize.getHeight()
      
      // Calculate dimensions to fit A4
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const ratio = canvasWidth / canvasHeight
      
      let imgWidth = width
      let imgHeight = width / ratio
      
      if (imgHeight > height) {
        imgHeight = height
        imgWidth = height * ratio
      }
      
      pdf.addImage(imgData, 'PNG', (width - imgWidth) / 2, 0, imgWidth, imgHeight)
      pdf.save(`Sendrix_Invoice_${data.invoice.number}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Failed to generate PDF. Please use the Print option.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#0F6E56' }} />
        <p style={{ color: '#5F5E5A', fontSize: 14 }}>Loading invoice...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '32px 40px', textAlign: 'center', maxWidth: 400 }}>
          <AlertCircle size={40} style={{ color: '#D85A30', marginBottom: 12 }} />
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No Invoice Available</h2>
          <p style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 20 }}>
            {data?.plan?.key === 'starter'
              ? "You're on the free plan. Upgrade to generate invoices."
              : error || 'No payment history found yet.'}
          </p>
          <Link href="/app/settings?tab=billing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#04342C', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Go to Billing
          </Link>
        </div>
      </div>
    )
  }

  const { invoice, customer, plan, pricing, payment } = data
  const isPaid = invoice.status === 'PAID'

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-root, #invoice-root * { visibility: visible; }
          #invoice-root { position: fixed; inset: 0; }
          #invoice-controls { display: none !important; }
          @page { margin: 0; size: A4; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .invoice-anim { animation: fadeUp 0.4s ease both; }

        .inv-table th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #888780; padding: 10px 16px; text-align: left; background: #F5F3EC; }
        .inv-table td { padding: 14px 16px; font-size: 13px; border-top: 1px solid #f0ede6; }
        .inv-table tr:last-child td { border-bottom: none; }
      `}</style>

      {/* Controls bar — hidden on print */}
      <div id="invoice-controls" style={{ background: '#fff', borderBottom: '1px solid #e2e0d9', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <button
          onClick={() => router.push('/app/settings?tab=billing')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#5F5E5A', fontFamily: 'inherit' }}
        >
          <ArrowLeft size={15} /> Back to Billing
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handlePrint}
            disabled={printing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#F5F3EC', border: '1px solid #e2e0d9', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#0e0e10' }}
          >
            <Printer size={14} />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#04342C', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', color: '#fff', boxShadow: '0 2px 8px rgba(4,52,44,.2)', opacity: downloading ? 0.7 : 1 }}
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Page background */}
      <div style={{ minHeight: 'calc(100vh - 57px)', background: '#F5F3EC', padding: '32px 24px' }}>
        {/* Invoice card */}
        <div
          id="invoice-root"
          ref={invoiceRef}
          className="invoice-anim"
          style={{
            maxWidth: 800,
            margin: '0 auto',
            background: '#fff',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 32px rgba(4,52,44,.10)',
            border: '1px solid #e2e0d9',
          }}
        >
          {/* ── HEADER ── */}
          <div style={{ background: 'linear-gradient(135deg, #04342C 0%, #0a4f3d 100%)', padding: '36px 48px 32px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle grid */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
              {/* Logo + tagline */}
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-1px', color: '#fff', fontFamily: 'Georgia, serif' }}>
                  sendrix
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', marginTop: 3, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  AI-Powered Onboarding Email Automation
                </div>
              </div>

              {/* INVOICE label + status badge */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>
                  INVOICE
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>{invoice.number}</div>
                {isPaid && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, background: '#EF9F27', color: '#04342C', fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <CheckCircle size={10} />
                    PAID
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── FROM / BILLED TO / DETAILS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderBottom: '1px solid #f0ede6' }}>
            {/* FROM */}
            <div style={{ padding: '24px 28px', borderRight: '1px solid #f0ede6' }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888780', marginBottom: 10 }}>FROM</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0e0e10', marginBottom: 4 }}>Sendrix</div>
              <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.7 }}>
                billing@sendrix.in<br />
                sendrix.in<br />
                123, Tech Park, OMR Road<br />
                Chennai, Tamil Nadu 600097
              </div>
            </div>

            {/* BILLED TO */}
            <div style={{ padding: '24px 28px', borderRight: '1px solid #f0ede6' }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888780', marginBottom: 10 }}>BILLED TO</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0e0e10', marginBottom: 4 }}>{customer.name}</div>
              <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.7 }}>
                {customer.email}
              </div>
            </div>

            {/* INVOICE DETAILS */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888780', marginBottom: 10 }}>INVOICE DETAILS</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { label: 'Invoice No.', value: invoice.number },
                    { label: 'Invoice Date', value: invoice.date },
                    ...(invoice.dueDate ? [{ label: 'Due Date', value: invoice.dueDate }] : []),
                    { label: 'Plan', value: plan.label },
                    { label: 'Billing', value: plan.billingCycle },
                  ].map(({ label, value }) => (
                    <tr key={label}>
                      <td style={{ fontSize: 11, color: '#888780', fontWeight: 600, paddingBottom: 5, paddingRight: 12, whiteSpace: 'nowrap' }}>{label}</td>
                      <td style={{ fontSize: 11, color: '#0e0e10', fontWeight: 700, paddingBottom: 5 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── SUBSCRIPTION PERIOD BANNER ── */}
          {invoice.period && (
            <div style={{ background: '#F5F3EC', padding: '12px 28px', borderBottom: '1px solid #f0ede6', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0F6E56', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#5F5E5A', fontWeight: 600 }}>
                Subscription Period: <strong style={{ color: '#0e0e10' }}>{invoice.period}</strong>
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, background: '#E1F5EE', color: '#0F6E56', padding: '3px 10px', borderRadius: 20 }}>
                {plan.foundingMember ? 'Founding Member' : plan.label}
              </span>
            </div>
          )}

          {/* ── LINE ITEMS TABLE ── */}
          <div style={{ padding: '0' }}>
            <table className="inv-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>DESCRIPTION</th>
                  <th style={{ textAlign: 'center' }}>QTY</th>
                  <th style={{ textAlign: 'right' }}>RATE</th>
                  <th style={{ textAlign: 'right', paddingRight: 28 }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ paddingLeft: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Sendrix {plan.label} Plan</div>
                    <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.6, maxWidth: 320 }}>{plan.description}</div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>1</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(pricing.subtotal)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, paddingRight: 28 }}>{fmt(pricing.subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── TOTALS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #f0ede6' }}>
            {/* Left: payment info + notes */}
            <div style={{ padding: '28px', borderRight: '1px solid #f0ede6' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888780', marginBottom: 14 }}>PAYMENT INFORMATION</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { label: 'Method', value: payment.method },
                    ...(payment.date ? [{ label: 'Date', value: payment.date }] : []),
                    ...(payment.transactionId ? [{ label: 'Transaction ID', value: payment.transactionId }] : []),
                  ].map(({ label, value }) => (
                    <tr key={label}>
                      <td style={{ fontSize: 12, color: '#888780', fontWeight: 600, paddingBottom: 7, paddingRight: 12 }}>{label}</td>
                      <td style={{ fontSize: 12, color: '#0e0e10', fontWeight: 600, paddingBottom: 7, wordBreak: 'break-all' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0ede6' }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888780', marginBottom: 10 }}>NOTES</div>
                <p style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.7, margin: 0 }}>
                  {plan.foundingMember
                    ? `Thank you for being a Sendrix Founding Member. Your price is locked at Rs.${pricing.subtotal}/month forever, even as we raise prices for future subscribers.`
                    : `Thank you for subscribing to Sendrix ${plan.label}. For any billing queries, contact billing@sendrix.in`}
                  <br /><br />
                  For any billing queries, contact <strong>billing@sendrix.in</strong>
                </p>
              </div>
            </div>

            {/* Right: summary totals */}
            <div style={{ padding: '28px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888780', marginBottom: 14 }}>SUMMARY</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { label: 'Subtotal', value: fmt(pricing.subtotal), bold: false },
                    { label: 'CGST (9%)', value: fmt(pricing.cgst), bold: false },
                    { label: 'SGST (9%)', value: fmt(pricing.sgst), bold: false },
                  ].map(({ label, value }) => (
                    <tr key={label}>
                      <td style={{ fontSize: 13, color: '#5F5E5A', paddingBottom: 10 }}>{label}</td>
                      <td style={{ fontSize: 13, color: '#0e0e10', fontWeight: 600, textAlign: 'right', paddingBottom: 10 }}>{value}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2}><div style={{ height: 1, background: '#f0ede6', margin: '4px 0 12px' }} /></td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: 15, fontWeight: 800, color: '#0e0e10', paddingBottom: 10 }}>TOTAL</td>
                    <td style={{ fontSize: 15, fontWeight: 900, color: '#0e0e10', textAlign: 'right', paddingBottom: 10 }}>{fmt(pricing.total)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: 13, color: '#0F6E56', fontWeight: 600, paddingBottom: 6 }}>Amount Paid</td>
                    <td style={{ fontSize: 13, color: '#0F6E56', fontWeight: 700, textAlign: 'right', paddingBottom: 6 }}>- {fmt(pricing.amountPaid)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <div style={{ background: '#E1F5EE', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#04342C' }}>Balance Due</span>
                        <span style={{ fontSize: 15, fontWeight: 900, color: '#04342C' }}>{fmt(pricing.balanceDue)}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{ background: '#F5F3EC', padding: '16px 28px', borderTop: '1px solid #f0ede6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <span style={{ fontSize: 11, color: '#888780', fontWeight: 600 }}>sendrix.in</span>
              <span style={{ fontSize: 11, color: '#888780', fontWeight: 600 }}>billing@sendrix.in</span>
            </div>
            <span style={{ fontSize: 11, color: '#D3D1C7' }}>Invoice {invoice.number} • Generated by Sendrix • Page 1 of 1</span>
          </div>
        </div>
      </div>
    </>
  )
}
