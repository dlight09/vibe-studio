import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/actions/auth'
import { prisma } from '@/lib/db'
import { formatDate, formatDateTime } from '@/lib/utils'
import { sellPlanAtCounter, adjustMemberCredits, getMemberEntitlementsInternal } from '@/lib/actions/membership'

export default async function AdminMemberDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const [user, plans, entitlements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { endAt: 'desc' },
          take: 10,
        },
        purchases: {
          include: { plan: true, payments: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        creditLedger: {
          orderBy: { createdAt: 'desc' },
          take: 25,
        },
      },
    }),
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    getMemberEntitlementsInternal(params.id),
  ])

  if (!user) notFound()

  const activeUnlimited = entitlements.activeUnlimited
  const creditBalance = entitlements.creditBalance

  return (
    <div className="admin-member-page">
      <div className="page-header">
        <a href="/admin/members" className="back-link">← Back to Members</a>
        <h1 className="page-title">{user.name}</h1>
        <p className="page-subtitle">{user.email}</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Entitlements</h2>
          </div>
          <div className="card-body">
            {activeUnlimited ? (
              <div className="membership-info">
                <div className="membership-type">
                  <span className="type-label">Active</span>
                  <span className="type-value">{activeUnlimited.plan.name}</span>
                </div>
                <div className="membership-expiry">
                  <span className="expiry-label">Ends</span>
                  <span className="expiry-value">{formatDate(activeUnlimited.endAt)}</span>
                </div>
              </div>
            ) : (
              <div className="membership-info">
                <div className="membership-type">
                  <span className="type-label">Credits</span>
                  <span className="type-value">{creditBalance}</span>
                </div>
                <div className="membership-expiry">
                  <span className="expiry-label">Role</span>
                  <span className="expiry-value">{user.role}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Sell Plan (Counter)</h2>
          </div>
          <div className="card-body">
            <form
              action={async (formData) => {
                'use server'

                const planId = (formData.get('planId') as string) || ''
                const paymentMethod = (formData.get('paymentMethod') as string) as any
                const amountStr = (formData.get('amountCents') as string) || ''
                const amountCents = amountStr.trim() ? Number(amountStr) : undefined
                const note = (formData.get('note') as string) || undefined

                await sellPlanAtCounter({
                  userId: user.id,
                  planId,
                  paymentMethod,
                  amountCents: Number.isFinite(amountCents as number) ? (amountCents as number) : undefined,
                  note,
                })

                redirect(`/admin/members/${user.id}`)
              }}
              className="instructor-form"
            >
              <div className="form-group">
                <label className="label" htmlFor="planId">Plan</label>
                <select id="planId" name="planId" className="input" required defaultValue="">
                  <option value="" disabled>
                    Select a plan...
                  </option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="paymentMethod">Payment Method</label>
                <select id="paymentMethod" name="paymentMethod" className="input" required>
                  <option value="CASH">Cash</option>
                  <option value="COUNTER_CARD">Card (Counter)</option>
                  <option value="COMP">Comp</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="amountCents">Amount (cents)</label>
                <input
                  id="amountCents"
                  name="amountCents"
                  type="number"
                  className="input"
                  placeholder="Leave blank for plan price"
                  min={0}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="note">Note</label>
                <input id="note" name="note" type="text" className="input" placeholder="Optional" />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Record Sale</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {session.role === 'ADMIN' && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <h2 className="card-title">Adjust Credits (Admin)</h2>
          </div>
          <div className="card-body">
            <form
              action={async (formData) => {
                'use server'

                const delta = Number(formData.get('delta') as string)
                const note = (formData.get('note') as string) || ''
                await adjustMemberCredits({ userId: user.id, delta, note })
                redirect(`/admin/members/${user.id}`)
              }}
              className="instructor-form"
            >
              <div className="form-group">
                <label className="label" htmlFor="delta">Delta</label>
                <input id="delta" name="delta" type="number" className="input" placeholder="e.g., 5 or -1" required />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="note-credit">Reason</label>
                <input id="note-credit" name="note" type="text" className="input" placeholder="Required" required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-secondary">Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-grid" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Purchases</h2>
          </div>
          <div className="card-body">
            {user.purchases.length === 0 ? (
              <div className="empty">
                <p className="empty-description">No purchases yet</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Payments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.purchases.map((p) => (
                      <tr key={p.id}>
                        <td>{formatDateTime(p.createdAt)}</td>
                        <td>{p.plan?.name || '—'}</td>
                        <td>{p.status}</td>
                        <td>{(p.totalCents / 100).toFixed(2)} {p.currency}</td>
                        <td className="text-muted">{p.payments.map((pay) => `${pay.method} ${(pay.amountCents / 100).toFixed(2)}`).join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Subscriptions</h2>
          </div>
          <div className="card-body">
            {user.subscriptions.length === 0 ? (
              <div className="empty">
                <p className="empty-description">No subscriptions yet</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Start</th>
                      <th>End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.subscriptions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.plan.name}</td>
                        <td>{s.status}</td>
                        <td>{formatDate(s.startAt)}</td>
                        <td>{formatDate(s.endAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <h2 className="card-title">Credit Ledger</h2>
        </div>
        <div className="card-body">
          {user.creditLedger.length === 0 ? (
            <div className="empty">
              <p className="empty-description">No credit activity</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Delta</th>
                    <th>Reason</th>
                    <th>Expires</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {user.creditLedger.map((e) => (
                    <tr key={e.id}>
                      <td>{formatDateTime(e.createdAt)}</td>
                      <td className={e.delta >= 0 ? 'text-success' : 'text-error'}>{e.delta >= 0 ? `+${e.delta}` : e.delta}</td>
                      <td>{e.reason}</td>
                      <td className="text-muted">{e.expiresAt ? formatDate(e.expiresAt) : '—'}</td>
                      <td className="text-muted">{e.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
