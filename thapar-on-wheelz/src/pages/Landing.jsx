import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Car, Shield, Zap, MapPin, ArrowRight, HelpCircle, ChevronDown, Sparkles, UserCheck, Compass, Coins, X } from 'lucide-react'
import { LOCATIONS, prettyLocation } from '../api/locations'
import styles from './Landing.module.css'

export default function Landing() {
  const { token, role } = useAuth()
  const navigate = useNavigate()

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null)
  
  // Banner state
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
      q: "Who is eligible to use ThaparOnWheelz?",
      a: "This service is strictly restricted to verified students, faculty members, and authorized campus rickshaw drivers of Thapar University. All accounts are validated using registered credentials."
    },
    {
      q: "How does the flat rate fare work?",
      a: "Every single trip requested and completed within the campus boundaries has a fixed flat price of INR 10. There are no surcharges, hidden fees, or surge pricing."
    },
    {
      q: "How do payments work?",
      a: "Payments are settled directly with the driver upon the completion of the ride. We support cash or standard UPI transfers directly to the driver."
    },
    {
      q: "How can I register as a driver?",
      a: "Driver and Administrator accounts are created directly by the system administrator to maintain security and safety protocols on campus. Students can register instantly using their campus email."
    }
  ]

  // Filter locations to keep selection list clean
  const selectLocations = LOCATIONS.slice(0, 15)

  return (
    <div className={styles.container}>
      {/* Sleek Announcement Banner */}
      {showBanner && (
        <div className={styles.announcementBanner}>
          <span>Flat INR 10 promotional rate active for the current semester</span>
          <button className={styles.bannerCloseBtn} onClick={() => setShowBanner(false)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Decorative Blur Glows */}
      <div className={`${styles.glow} ${styles.one}`} />
      <div className={`${styles.glow} ${styles.two}`} />

      {/* Navigation Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Car size={20} color="#ffffff" />
          </div>
          <span className={styles.logoText}>ThaparOnWheelz</span>
        </div>
        <div>
          {token ? (
            <button className="btn btn-primary btn-sm" onClick={handleCTA}>
              Go to Dashboard
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
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
        {/* Floating Backdrop Symbols */}
        <div className={`${styles.floatingSymbol} ${styles.symbolOne}`}>
          <Car size={28} />
        </div>
        <div className={`${styles.floatingSymbol} ${styles.symbolTwo}`}>
          <Zap size={20} fill="currentColor" strokeWidth={0} />
        </div>
        <div className={`${styles.floatingSymbol} ${styles.symbolThree}`}>
          <Shield size={24} />
        </div>
        <div className={`${styles.floatingSymbol} ${styles.symbolFour}`}>
          <MapPin size={22} />
        </div>
        <div className={`${styles.floatingSymbol} ${styles.symbolFive}`}>
          <Sparkles size={18} fill="currentColor" strokeWidth={0} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={12} style={{ marginRight: '6px', color: 'var(--primary-light)' }} />
            Thapar University Campus Ride Booking
          </div>
          <h1 className={styles.title}>
            Campus Rides <br />
            <span>Made Simple</span>
          </h1>
          <p className={styles.subtitle}>
            Affordable, reliable, and quick campus e-rickshaw booking. 
            Travel anywhere inside Thapar University for a flat fare of INR 10.
          </p>
          <div className={styles.ctaGroup}>
            <button className="btn btn-primary btn-lg" onClick={handleCTA}>
              Book a Ride <ArrowRight size={18} />
            </button>
            {!token && (
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/register')}>
                Create Student Account
              </button>
            )}
          </div>

          {/* Animated Scroll Down Indicator */}
          <div className={styles.scrollIndicator}>
            <div className={styles.mouse}>
              <div className={styles.wheel} />
            </div>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>Scroll Down</span>
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
            <p>Campus Hubs</p>
          </div>
          <div className={styles.statItem}>
            <h3>100%</h3>
            <p>Verified Profiles</p>
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
                <UserCheck size={22} color="var(--primary)" />
              </div>
              <h4>Register Profile</h4>
              <p>Sign up instantly using your campus @thapar.edu email. Settle your profile by entering your phone and roll number details.</p>
            </div>
            
            <div className={styles.stepConnector} />

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepIcon}>
                <Compass size={22} color="var(--primary)" />
              </div>
              <h4>Request a Ride</h4>
              <p>Set your pickup and dropoff spots from verified campus landmarks. We match you with an available driver immediately.</p>
            </div>

            <div className={styles.stepConnector} />

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepIcon}>
                <Coins size={22} color="var(--primary)" />
              </div>
              <h4>Pay Flat INR 10</h4>
              <p>Meet your driver at the designated pickup point. Settle the fixed flat rate of INR 10 upon reaching your destination safely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Why ThaparOnWheelz?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ color: 'var(--primary)' }}>
              <Zap size={22} fill="var(--primary)" strokeWidth={0} />
            </div>
            <h4>Flat Pricing</h4>
            <p>No surge charges or pricing shifts. Every trip is flat INR 10 anywhere inside the campus boundaries.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ color: 'var(--success)' }}>
              <Shield size={22} />
            </div>
            <h4>Verified Accounts</h4>
            <p>Exclusively for verified Thapar students and drivers. Background checks ensure high security.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon} style={{ color: 'var(--info)' }}>
              <MapPin size={22} />
            </div>
            <h4>Full Coverage</h4>
            <p>From Hostels (FRF/FRG/Viyat) to departments and auditoriums, we connect all key landmarks.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <h2 className={styles.sectionTitle}>What Campus Users Say</h2>
        <div className={styles.testimonialsGrid}>
          <div className={styles.testimonialCard}>
            <p className={styles.quote}>"ThaparOnWheelz is a lifesaver for early morning lectures. Booking a ride from the main gate to CSED takes under 10 seconds, and the INR 10 flat rate is extremely student-friendly."</p>
            <div className={styles.author}>
              <strong>Aarav Sharma</strong>
              <span>B.Tech CSE Student</span>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <p className={styles.quote}>"Operating as a driver is much more structured now. The pending rides feed is real-time, helping us locate students quickly across campus hostels without guessing."</p>
            <div className={styles.author}>
              <strong>Gurpreet Singh</strong>
              <span>Campus Rickshaw Partner</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <HelpCircle size={22} style={{ color: 'var(--primary)' }} /> Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '3rem' }}>
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={styles.faqCard} 
                onClick={() => toggleFaq(idx)}
                style={{ cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', overflow: 'hidden', transition: 'var(--transition)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{faq.q}</h4>
                  <ChevronDown 
                    size={16} 
                    style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', color: 'var(--text-muted)' }} 
                  />
                </div>
                {openFaq === idx && (
                  <div style={{ padding: '0 1.5rem 1.25rem 1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,0,0,0.02)', lineHeight: 1.6 }}>
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
        <h2 className={styles.sectionTitle}>Popular Campus Hubs</h2>
        <div className={styles.locationChips}>
          {selectLocations.slice(0, 8).map((loc, idx) => (
            <span key={idx} className={styles.chip}>
              <MapPin size={12} style={{ marginRight: '4px', opacity: 0.7 }} />
              {prettyLocation(loc)}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} ThaparOnWheelz. All rights reserved.</p>
        <p style={{ marginTop: '0.25rem', opacity: 0.6 }}>Designed exclusively for Thapar University campus travel.</p>
      </footer>
    </div>
  )
}
