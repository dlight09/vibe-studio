'use client'

import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type ClassFormState = {
  error?: string
  success?: boolean
}

type Option = { id: string; name: string; durationMinutes?: number }

interface ClassFormProps {
  classTypes: Option[]
  instructors: Option[]
  initial?: {
    classTypeId: string
    instructorId: string
    startTime: string
    durationMinutes: number
    capacity: number
    room?: string | null
  }
  action: (prevState: ClassFormState, formData: FormData) => Promise<ClassFormState>
  submitLabel: string
}

export default function ClassForm({ classTypes, instructors, initial, action, submitLabel }: ClassFormProps) {
  const router = useRouter()
  const [state, formAction] = useFormState<ClassFormState, FormData>(action, { success: false })

  useEffect(() => {
    if (state.success) {
      router.push('/admin/classes')
      router.refresh()
    }
  }, [state.success, router])

  return (
    <form action={formAction} className="card" style={{ padding: '24px', display: 'grid', gap: '16px' }}>
      <div className="form-group">
        <label className="label" htmlFor="classTypeId">Class Type</label>
        <select className="input" id="classTypeId" name="classTypeId" required defaultValue={initial?.classTypeId}>
          <option value="">Select class type</option>
          {classTypes.map((ct) => (
            <option key={ct.id} value={ct.id}>{ct.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="label" htmlFor="instructorId">Instructor</label>
        <select className="input" id="instructorId" name="instructorId" required defaultValue={initial?.instructorId}>
          <option value="">Select instructor</option>
          {instructors.map((inst) => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="label" htmlFor="startTime">Start Time</label>
        <input
          className="input"
          type="datetime-local"
          id="startTime"
          name="startTime"
          required
          defaultValue={initial?.startTime}
        />
      </div>

      <div className="form-group">
        <label className="label" htmlFor="durationMinutes">Duration (minutes)</label>
        <input
          className="input"
          type="number"
          min={15}
          step={5}
          id="durationMinutes"
          name="durationMinutes"
          required
          defaultValue={initial?.durationMinutes ?? 60}
        />
      </div>

      <div className="form-group">
        <label className="label" htmlFor="capacity">Capacity</label>
        <input
          className="input"
          type="number"
          min={1}
          id="capacity"
          name="capacity"
          required
          defaultValue={initial?.capacity ?? 20}
        />
      </div>

      <div className="form-group">
        <label className="label" htmlFor="room">Room</label>
        <input
          className="input"
          type="text"
          id="room"
          name="room"
          placeholder="Main Studio"
          defaultValue={initial?.room ?? ''}
        />
      </div>

      {state.error && (
        <div className="card" style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'rgb(239,68,68)' }}>
          {state.error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <a className="btn btn-secondary" href="/admin/classes">Cancel</a>
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  )
}
