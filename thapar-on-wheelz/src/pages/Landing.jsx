import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Car, Zap, MapPin, ArrowRight, HelpCircle, ChevronDown, Sparkles, UserCheck, Compass, Coins, X } from 'lucide-react'
import { LOCATIONS, prettyLocation } from '../api/locations'
import styles from './Landing.module.css'

export default function Landing() {
  const { token, role } = useAuth()
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [showBanner, setShowBanner] = useState(true)

  function handleCTA() {
    if (token) {
      navigate(`/${role?.toLowerCase()}`)
    } else {
      navigate('/login')
    }
  }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      q: "Who can use ThaparOnWheelz?",
      a: "This service is available to verified students, faculty members, and authorized campus rickshaw drivers of Thapar University."
    },
    {
      q: "How does the flat rate fare work?",
      a: "Every single trip requested and completed within the campus boundaries has a fixed flat price of INR 10. There are no surge prices or extra charges."
    },
    {
      q: "How do payments work?",
      a: "Payments are settled directly with the driver upon the completion of the ride via Cash or UPI."
    },
    {
      q: "How do drivers get registered?",
      a: "Driver and Administrator accounts are set up by the system administrator to maintain campus safety protocols."
    }
  ]

  const selectLocations = LOCATIONS.slice(0, 12)

  return (
    <div className={styles.container}>
      {/* Top Announcement Banner */}
      {showBanner && (
        <div className={styles.announcementBanner}>
          <span>TIET Campus Shuttle • Fixed INR 10 flat rate active</span>
          <button className={styles.bannerCloseBtn} onClick={() => setShowBanner(false)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <div>
            <span className={styles.logoText}>ThaparOnWheelz</span>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>CAMPUS SHUTTLE</div>
          </div>
        </div>
        <div>
          {token ? (
            <button className="btn btn-primary btn-sm" onClick={handleCTA}>
              Go to Dashboard &rarr;
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={12} style={{ marginRight: '6px', color: 'var(--primary)' }} />
            Thapar Institute of Engineering & Technology
          </div>
          <h1 className={styles.title}>
            Thapar Campus Shuttle <br />
            <span>Fast & Affordable</span>
          </h1>
          <p className={styles.subtitle}>
            Seamless e-rickshaw ride booking across Thapar University campus. 
            Travel anywhere inside campus for a flat fare of <strong>INR 10</strong>.
          </p>
          <div className={styles.ctaGroup}>
            <button className="btn btn-primary btn-lg" onClick={handleCTA}>
              Book a Ride <ArrowRight size={16} />
            </button>
            {!token && (
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/register')}>
                Create Account
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <h3>INR 10</h3>
            <p>Flat Fare Per Trip</p>
          </div>
          <div className={styles.statItem}>
            <h3>40+</h3>
            <p>Campus Landmarks</p>
          </div>
          <div className={styles.statItem}>
            <h3>100%</h3>
            <p>On-Campus Service</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className={styles.stepsSection}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepIcon}>
                <UserCheck size={20} color="var(--primary)" />
              </div>
              <h4>Sign In</h4>
              <p>Log in with your account to access campus e-rickshaw booking.</p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepIcon}>
                <Compass size={20} color="var(--primary)" />
              </div>
              <h4>Choose Route</h4>
              <p>Pick your pickup and dropoff points from campus landmark locations.</p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepIcon}>
                <Coins size={20} color="var(--primary)" />
              </div>
              <h4>Ride for ₹10</h4>
              <p>Meet your driver and pay the fixed flat rate of INR 10 at destination.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Key Features</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Zap size={20} color="var(--primary)" />
            </div>
            <h4>Flat INR 10 Fare</h4>
            <p>No surge pricing. Fixed price everywhere on campus.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Car size={20} color="var(--navy)" />
            </div>
            <h4>Verified Campus Drivers</h4>
            <p>Drivers and vehicles registered specifically for TIET campus routes.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <MapPin size={20} color="var(--primary)" />
            </div>
            <h4>Full Campus Coverage</h4>
            <p>Connecting all hostels, academic blocks, COS, library, and gates.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className={styles.sectionTitle}>
            <HelpCircle size={20} style={{ color: 'var(--primary)', marginRight: '8px' }} /> Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={styles.faqCard} 
                onClick={() => toggleFaq(idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{faq.q}</h4>
                  <ChevronDown 
                    size={16} 
                    style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }} 
                  />
                </div>
                {openFaq === idx && (
                  <div style={{ padding: '0 1.25rem 1rem 1.25rem', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Preview */}
      <section className={styles.locations}>
        <h2 className={styles.sectionTitle}>Campus Hubs</h2>
        <div className={styles.locationChips}>
          {selectLocations.map((loc, idx) => (
            <span key={idx} className={styles.chip}>
              <MapPin size={12} style={{ marginRight: '4px', opacity: 0.7 }} />
              {prettyLocation(loc)}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} ThaparOnWheelz • Thapar Institute of Engineering & Technology</p>
      </footer>
    </div>
  )
}
