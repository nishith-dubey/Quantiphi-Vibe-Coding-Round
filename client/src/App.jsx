import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const emptyForm = { serviceName: '', cost: '', billingCycle: 'Monthly', nextRenewalDate: '' }

function App() {
  const [subscriptions, setSubscriptions] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`${API_URL}/subscriptions`)
      .then(({ data }) => setSubscriptions(data))
      .catch(() => setError('Could not connect to the server. Start the API and refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const metrics = useMemo(() => {
    const monthlyBurn = subscriptions.filter((item) => item.active).reduce((total, item) => {
      const monthlyCost = item.billingCycle === 'Yearly' ? Number(item.cost) / 12 : Number(item.cost)
      return total + monthlyCost
    }, 0)
    const upcoming = subscriptions.filter((item) => item.active && isRenewingSoon(item.nextRenewalDate))
    return { monthlyBurn, upcoming: upcoming.length }
  }, [subscriptions])

  async function addSubscription(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data } = await axios.post(`${API_URL}/subscriptions`, { ...form, cost: Number(form.cost) })
      setSubscriptions((current) => [data, ...current])
      setForm(emptyForm)
    } catch {
      setError('Subscription could not be added. Check the form and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleSubscription(subscription) {
    try {
      const { data } = await axios.patch(`${API_URL}/subscriptions/${subscription._id}`, { active: !subscription.active })
      setSubscriptions((current) => current.map((item) => item._id === data._id ? data : item))
    } catch {
      setError('Status could not be updated.')
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand-mark">ST</div><span>Subtrack</span><span className="topbar-note">Personal finance, made visible.</span></header>
      <div className="content">
        <section className="intro"><div><p className="eyebrow">{formatToday()}</p><h1>Your subscriptions,<br /><em>under control.</em></h1></div><div className="intro-copy">Know what is leaving your account, when it happens, and what can wait.</div></section>
        {error && <div className="error-message">{error}</div>}
        <section className="metrics" aria-label="Subscription summary">
          <Metric label="Monthly burn rate" value={`$${metrics.monthlyBurn.toFixed(2)}`} detail="Active subscriptions only" accent="lime" />
          <Metric label="Renewing soon" value={metrics.upcoming.toString().padStart(2, '0')} detail="Within the next 7 days" accent="orange" />
          <Metric label="Subscriptions" value={subscriptions.length.toString().padStart(2, '0')} detail={`${subscriptions.filter((item) => item.active).length} active · ${subscriptions.filter((item) => !item.active).length} paused`} accent="blue" />
        </section>
        <section className="workspace">
          <div className="section-heading"><div><p className="eyebrow">Your recurring spend</p><h2>All subscriptions</h2></div><span className="live-dot">Live overview</span></div>
          {loading ? <p className="empty-state">Loading your subscriptions...</p> : subscriptions.length === 0 ? <p className="empty-state">Nothing here yet. Add your first subscription below.</p> : <div className="table-wrap"><table><thead><tr><th>Service</th><th>Cost</th><th>Cycle</th><th>Next renewal</th><th>Status</th><th aria-label="Toggle status" /></tr></thead><tbody>{subscriptions.map((subscription) => <SubscriptionRow key={subscription._id} subscription={subscription} onToggle={toggleSubscription} />)}</tbody></table></div>}
          <div className="add-panel"><div><p className="eyebrow">New commitment</p><h2>Add a subscription</h2></div><form onSubmit={addSubscription}><label>Service name<input required value={form.serviceName} onChange={(event) => setForm({ ...form, serviceName: event.target.value })} placeholder="e.g. Figma" /></label><label>Cost<input required min="0" step="0.01" type="number" value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} placeholder="0.00" /></label><label>Billing cycle<select value={form.billingCycle} onChange={(event) => setForm({ ...form, billingCycle: event.target.value })}><option>Monthly</option><option>Yearly</option></select></label><label>Next renewal<input required type="date" value={form.nextRenewalDate} onChange={(event) => setForm({ ...form, nextRenewalDate: event.target.value })} /></label><button disabled={saving} type="submit">{saving ? 'Adding...' : 'Add subscription'} <span>+</span></button></form></div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value, detail, accent }) { return <div className={`metric metric-${accent}`}><p>{label}</p><strong>{value}</strong><span>{detail}</span></div> }
function SubscriptionRow({ subscription, onToggle }) { const soon = subscription.active && isRenewingSoon(subscription.nextRenewalDate); return <tr className={!subscription.active ? 'paused' : ''}><td><div className="service-name"><span className="service-icon">{subscription.serviceName.slice(0, 1).toUpperCase()}</span><strong>{subscription.serviceName}</strong></div></td><td className="cost">${Number(subscription.cost).toFixed(2)}</td><td>{subscription.billingCycle}</td><td><span>{formatDate(subscription.nextRenewalDate)}</span>{soon && <span className="renewal-badge">Renewing soon</span>}</td><td><span className={`status ${subscription.active ? 'status-active' : 'status-paused'}`}>{subscription.active ? 'Active' : 'Paused'}</span></td><td><button className={`toggle ${subscription.active ? 'on' : ''}`} aria-label={`Set ${subscription.serviceName} ${subscription.active ? 'paused' : 'active'}`} onClick={() => onToggle(subscription)}><span /></button></td></tr> }
function daysUntil(date) { return Math.ceil((new Date(`${date}T00:00:00`) - new Date(new Date().toDateString())) / 86400000) }
function isRenewingSoon(date) { const days = daysUntil(date); return days >= 0 && days <= 7 }
function formatToday() { return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }
function formatDate(date) { return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }

export default App
