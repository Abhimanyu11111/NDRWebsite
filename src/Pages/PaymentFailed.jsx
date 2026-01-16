import { XCircle, Home, RefreshCw, Mail, Phone } from 'lucide-react';

export default function PaymentFailed() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #fef2f2, #ffffff, #fff7ed)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '672px', width: '100%' }}>
        {/* Main Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #fee2e2',
          padding: '48px'
        }}>
          {/* Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '96px',
              height: '96px',
              backgroundColor: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '64px', height: '64px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '12px'
            }}>
              Payment Failed
            </h1>
            <p style={{ fontSize: '18px', color: '#4b5563' }}>
              We couldn't process your payment. Please try again.
            </p>
          </div>

          {/* Error Details Box */}
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontWeight: '600',
              color: '#111827',
              marginBottom: '12px'
            }}>
              Possible Reasons:
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                color: '#374151',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#dc2626', marginRight: '8px' }}>•</span>
                <span>Insufficient funds in your account</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                color: '#374151',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#dc2626', marginRight: '8px' }}>•</span>
                <span>Incorrect payment details entered</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                color: '#374151',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#dc2626', marginRight: '8px' }}>•</span>
                <span>Network connectivity issues</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                color: '#374151'
              }}>
                <span style={{ color: '#dc2626', marginRight: '8px' }}>•</span>
                <span>Payment gateway timeout</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ marginBottom: '32px' }}>
            <button style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Payment
            </button>
            
            <button style={{
              width: '100%',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Homepage
            </button>
          </div>

          {/* Support Section */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px'
          }}>
            <p style={{
              textAlign: 'center',
              color: '#4b5563',
              marginBottom: '16px'
            }}>
              Need help? Contact our support team
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <a href="mailto:support@gov.in" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#2563eb',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.target.style.color = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.color = '#2563eb'}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span style={{ fontWeight: '500' }}>support@gov.in</span>
              </a>
              <a href="tel:1800-xxx-xxxx" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#2563eb',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.target.style.color = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.color = '#2563eb'}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span style={{ fontWeight: '500' }}>1800-XXX-XXXX</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280',
          marginTop: '24px'
        }}>
          Transaction ID: TXN{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
      </div>
    </div>
  );
}