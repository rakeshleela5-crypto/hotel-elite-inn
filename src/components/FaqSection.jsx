import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Clock, MapPin, ShieldCheck, Utensils, FileText, CreditCard, Sparkles } from 'lucide-react';

const FAQS = [
  {
    id: 'checkin',
    icon: Clock,
    question: "What are the check-in and check-out timings?",
    answer: "Hotel Elite Inn operates on a true 24-Hours Check-out System as stated on our official tariff card. Your 24-hour stay cycle begins when you check in! Every room stay includes complimentary buffet breakfast and 1 liter packaged drinking mineral water in the room. For early arrivals or custom timings, call +91 6370757541 or dial Intercom 9."
  },
  {
    id: 'proximity',
    icon: MapPin,
    question: "Where is Hotel Elite Inn located and how close is the Railway Station?",
    answer: "Hotel Elite Inn is strategically situated Near Railway Station Main Road, Muniguda, Dist.-Rayagada (Odisha) – PIN 765020. The hotel is within quick walking distance of Muniguda Railway Station, providing seamless transit access for business travelers and tourists."
  },
  {
    id: 'wifi-intercom',
    icon: Sparkles,
    question: "What are the in-room Wi-Fi networks and Intercom directory?",
    answer: "High-speed Wi-Fi is provided complimentary on every floor: Floor 1 (SSID: 'TP 1ST FLOOR'), Floor 2 (SSID: 'TP 2ND FLOOR'), Floor 3 (SSID: 'TP 3RD FLOOR') with password 'Elite@123'. In-room Intercom extensions connect directly to Reception (9), Restaurant (111), Kitchen (112), Store Room (113), Laundry (114), GM Sir (115), and MD Sir (116)."
  },
  {
    id: 'id-proof',
    icon: ShieldCheck,
    question: "What government identity proofs are mandatory for check-in?",
    answer: "As mandated by statutory hospitality regulations under the Sarai Act, all adult guests (18+ years) must present an original government-issued photo ID at check-in (Aadhaar, Passport, Voter ID, or Driving License). Under privacy guidelines, Aadhaar numbers are masked for guest security."
  },
  {
    id: 'dining-plans',
    icon: Utensils,
    question: "What meal plans and dining options are available?",
    answer: "All room bookings include complimentary buffet breakfast. In addition, guests can opt for MAP Plan (+₹600) or AP Plan (+₹1,000) for complete in-house dining. Room service can be ordered anytime by calling Intercom 111 (Restaurant) or 112 (Kitchen)."
  },
  {
    id: 'tariffs-cards',
    icon: CreditCard,
    question: "What are the room tariffs and accepted payment modes?",
    answer: "Our 27 AC rooms are structured across 4 tiers: Standard Room (Single ₹1,450), Deluxe Room (Single ₹1,750 / Double ₹2,250), Executive Room (Single ₹2,050 / Double ₹2,450), and Suite Room (Single ₹3,250 / Double ₹3,850). Extra person/bed is ₹550. We accept Master & Visa credit/debit cards, UPI, and cash."
  }
];

export default function FaqSection({ onOpenBooking }) {
  const [openId, setOpenId] = useState('checkin');

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" style={{
      padding: '5rem 1.5rem',
      background: 'linear-gradient(180deg, #060e1a 0%, #0c182b 100%)',
      borderTop: '1px solid rgba(212, 175, 55, 0.15)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '9999px',
            color: '#d4af37',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem'
          }}>
            <HelpCircle size={14} />
            Guest Inquiries & Transparency
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.2rem',
            color: '#ffffff',
            letterSpacing: '0.02em',
            marginBottom: '0.5rem'
          }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: 600, margin: '0 auto' }}>
            Everything you need to know regarding 24-hr check-out, Wi-Fi credentials, Intercom directory, and tariffs at Hotel Elite Inn, Muniguda (Rayagada).
          </p>
        </div>

        {/* Accordion List */}
        {/* Accordion List with Emil Kowalski Fluid CSS Grid Motion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {FAQS.map(faq => {
            const Icon = faq.icon;
            const isOpen = openId === faq.id;

            return (
              <div 
                key={faq.id}
                style={{
                  background: isOpen ? 'linear-gradient(135deg, rgba(12, 24, 43, 0.95), rgba(18, 34, 60, 0.9))' : 'rgba(6, 14, 26, 0.65)',
                  border: isOpen ? '1px solid var(--gold-glow)' : '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '14px',
                  boxShadow: isOpen ? '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.15)' : '0 4px 15px rgba(0, 0, 0, 0.3)',
                  overflow: 'hidden',
                  transition: 'transform 0.24s var(--ease-luxury), box-shadow 0.24s ease, border-color 0.24s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isOpen) {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                  }
                }}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s ease'
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      padding: '0.5rem',
                      borderRadius: '10px',
                      background: isOpen ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(243, 198, 76, 0.15))' : 'rgba(255, 255, 255, 0.05)',
                      border: isOpen ? '1px solid var(--gold-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: isOpen ? 'var(--gold-glow)' : '#94a3b8',
                      transition: 'all 0.24s var(--ease-luxury)'
                    }}>
                      <Icon size={19} />
                    </div>
                    <span style={{ fontSize: '1.02rem', fontWeight: 700, color: isOpen ? '#fff' : '#e2e8f0', letterSpacing: '0.01em' }}>
                      {faq.question}
                    </span>
                  </div>

                  <div style={{
                    color: isOpen ? 'var(--gold-glow)' : '#64748b',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s var(--ease-spring), color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ChevronDown size={22} />
                  </div>
                </button>

                {/* Smooth CSS Grid Accordion Drawer */}
                <div 
                  id={`faq-answer-${faq.id}`}
                  className={`accordion-grid ${isOpen ? 'is-open' : ''}`}
                >
                  <div className="accordion-inner">
                    <div style={{
                      padding: '0.2rem 1.6rem 1.4rem 4.1rem',
                      fontSize: '0.9rem',
                      lineHeight: 1.65,
                      color: '#cbd5e1',
                      borderTop: '1px solid rgba(212, 175, 55, 0.12)'
                    }}>
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assistance Banner */}
        <div style={{
          marginTop: '2.5rem',
          textAlign: 'center',
          background: 'rgba(12, 24, 43, 0.5)',
          border: '1px dashed rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
              Have a special request or large group reservation?
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Our front desk manager is on duty 24/7 at +91 6370757541.
            </div>
          </div>

          <button
            onClick={onOpenBooking}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
          >
            Reserve Your Room Direct
          </button>
        </div>

      </div>
    </section>
  );
}
