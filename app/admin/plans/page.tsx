import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions/auth'
import { createPlan, listPlans, setPlanActive } from '@/lib/actions/membership'

function formatMoney(cents: number, currency: string) {
  const value = (cents / 100).toFixed(2)
  return `${value} ${currency}`
}

export default async function AdminPlansPage({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const plans = await listPlans()

  return (
    <div className="admin-plans-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Plans</h1>
          <p className="page-subtitle">Create and manage membership plans</p>
          {searchParams?.error && <p className="text-error" style={{ marginTop: 8 }}>{searchParams.error}</p>}
        </div>
      </div>

      {session.role === 'ADMIN' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h2 className="card-title">Create Plan</h2>
          </div>
          <div className="card-body">
            <form
              action={async (formData) => {
                'use server'

                const name = (formData.get('name') as string) || ''
                const type = (formData.get('type') as string) as any
                const priceCents = Number(formData.get('priceCents') as string)
                const currency = ((formData.get('currency') as string) || 'USD').toUpperCase()

                const durationDaysStr = (formData.get('durationDays') as string) || ''
                const creditsStr = (formData.get('credits') as string) || ''
                const creditExpiryDaysStr = (formData.get('creditExpiryDays') as string) || ''

                const res = await createPlan({
                  name,
                  type,
                  priceCents,
                  currency,
                  durationDays: durationDaysStr.trim() ? Number(durationDaysStr) : null,
                  credits: creditsStr.trim() ? Number(creditsStr) : null,
                  creditExpiryDays: creditExpiryDaysStr.trim() ? Number(creditExpiryDaysStr) : null,
                })

                if ((res as any)?.error) {
                  redirect(`/admin/plans?error=${encodeURIComponent((res as any).error)}`)
                }

                redirect('/admin/plans')
              }}
              className="instructor-form"
            >
              <div className="form-group">
                <label className="label" htmlFor="name">Name</label>
                <input id="name" name="name" className="input" required placeholder="e.g., Unlimited (30 days)" />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="type">Type</label>
                <select id="type" name="type" className="input" required defaultValue="UNLIMITED">
                  <option value="UNLIMITED">Unlimited</option>
                  <option value="CLASS_PACK">Class Pack</option>
                  <option value="DROP_IN">Drop-in</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="priceCents">Price (cents)</label>
                <input id="priceCents" name="priceCents" type="number" className="input" min={0} required />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="currency">Currency</label>
                <input id="currency" name="currency" className="input" defaultValue="USD" />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="durationDays">Duration Days (Unlimited)</label>
                <input id="durationDays" name="durationDays" type="number" className="input" min={1} placeholder="e.g., 30" />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="credits">Credits (Pack/Drop-in)</label>
                <input id="credits" name="credits" type="number" className="input" min={1} placeholder="e.g., 10" />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="creditExpiryDays">Credit Expiry Days</label>
                <input id="creditExpiryDays" name="creditExpiryDays" type="number" className="input" min={1} placeholder="e.g., 60" />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Price</th>
              <th>Entitlement</th>
              <th>Status</th>
              {session.role === 'ADMIN' && <th />}
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="text-muted">{p.type}</td>
                <td>{formatMoney(p.priceCents, p.currency)}</td>
                <td className="text-muted">
                  {p.type === 'UNLIMITED'
                    ? `${p.durationDays ?? 30} days`
                    : `${p.credits ?? 1} credits${p.creditExpiryDays ? ` / ${p.creditExpiryDays}d` : ''}`}
                </td>
                <td>
                  <span className={p.isActive ? 'badge badge-success' : 'badge'}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {session.role === 'ADMIN' && (
                  <td>
                    <form
                      action={async () => {
                        'use server'
                        await setPlanActive(p.id, !p.isActive)
                        redirect('/admin/plans')
                      }}
                    >
                      <button type="submit" className="btn btn-ghost btn-sm">
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {plans.length === 0 && (
          <div className="empty">
            <h3 className="empty-title">No plans</h3>
            <p className="empty-description">Create your first plan to start selling memberships.</p>
          </div>
        )}
      </div>
    </div>
  )
}
