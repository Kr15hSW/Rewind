import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { getUser, updateUser, type UserResponse } from '../services/userService'
import { getCollection } from '../services/mediaService'
import { normalizeStatus, normalizeMediaType } from '../utils/status'
import type { CollectionEntryResponse } from '../types'

const TYPE_COLORS: Record<string, string> = {
  Movie:  '#7C3AED',
  Series: '#3B82F6',
  Book:   '#F97316',
  Game:   '#4ADE80',
}

export default function ProfilePage() {
  const { t }                    = useTranslation()
  const { updateUser: updateCtx } = useAuth()

  const [userInfo,    setUserInfo]    = useState<UserResponse | null>(null)
  const [collection,  setCollection]  = useState<CollectionEntryResponse[]>([])
  const [loading,     setLoading]     = useState(true)

  const [editOpen,    setEditOpen]    = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [currentPwd,  setCurrentPwd]  = useState('')
  const [newPwd,      setNewPwd]      = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saveError,   setSaveError]   = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getUser(), getCollection()])
      .then(([usr, raw]) => {
        setUserInfo(usr)
        setNewUsername(usr.username)
        setCollection(raw.map(e => ({
          ...e,
          status:    normalizeStatus(e.status),
          mediaItem: { ...e.mediaItem, type: normalizeMediaType(e.mediaItem.type) },
        })))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(null)
    try {
      const payload: UpdateUserRequest = {}
      if (newUsername && newUsername !== userInfo?.username) payload.username = newUsername
      if (newPwd) { payload.currentPassword = currentPwd; payload.newPassword = newPwd }
      if (!Object.keys(payload).length) { setSaving(false); return }

      const updated = await updateUser(payload)
      setUserInfo(updated)
      updateCtx({ username: updated.username })
      setCurrentPwd('')
      setNewPwd('')
      setSaveSuccess(t('profile.saveSuccess'))
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (err) {
      if (err instanceof Error) {
        if      (err.message === 'wrong_password')  setSaveError(t('profile.wrongPassword'))
        else if (err.message === 'username_taken')  setSaveError(t('profile.usernameTaken'))
        else                                        setSaveError(t('profile.updateError'))
      }
    } finally {
      setSaving(false)
    }
  }

  // Statistics
  const scored       = collection.filter(e => e.score !== null)
  const avgScore     = scored.length > 0
    ? (scored.reduce((s, e) => s + (e.score ?? 0), 0) / scored.length).toFixed(1)
    : null
  const completionPct = collection.length > 0
    ? Math.round((collection.filter(e => e.status === 'Completed').length / collection.length) * 100)
    : 0

  const scoreData = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: scored.filter(e => e.score === i + 1).length,
  }))

  const typeData = (['Movie', 'Series', 'Book', 'Game'] as const)
    .map(type => ({
      name:  t(`search.type.${type}`),
      value: collection.filter(e => e.mediaItem.type === type).length,
      color: TYPE_COLORS[type],
    }))
    .filter(d => d.value > 0)

  if (loading) return (
    <div style={{ padding: '32px 24px' }}>
      <p style={{ color: 'var(--color-text-muted)' }}>{t('common.loading')}</p>
    </div>
  )

  return (
    <div style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Avatar and basic data */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '36px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
          background: 'var(--gradient-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 700, color: 'white',
        }}>
          {userInfo?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
            {userInfo?.username}
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            {userInfo?.email}
          </p>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
            {t('profile.memberSince')}{' '}
            {userInfo ? new Date(userInfo.createdAt).toLocaleDateString() : ''}
          </p>
        </div>
      </div>

      {/* Edit account */}
      <ProfileSection title={t('profile.editSection')}>
        <button
          onClick={() => { setEditOpen(p => !p); setSaveError(null); setSaveSuccess(null) }}
          style={{
            background: 'none',
            border: '1.5px solid rgba(124,58,237,0.3)', borderRadius: '8px',
            padding: '8px 16px', color: 'var(--color-text-muted)',
            cursor: 'pointer', fontSize: '0.85rem',
            marginBottom: editOpen ? '20px' : 0,
          }}
        >
          {editOpen ? t('common.cancel') : `${t('profile.editSection')} ✎`}
        </button>

        {editOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {saveSuccess && <p style={{ color: '#4ADE80', fontSize: '0.85rem', margin: 0 }}>{saveSuccess}</p>}
            {saveError   && <p style={{ color: '#F87171', fontSize: '0.85rem', margin: 0 }}>{saveError}</p>}

            <FormField label={t('auth.username')}>
              <input value={newUsername} onChange={e => setNewUsername(e.target.value)} style={inputStyle} />
            </FormField>
            <FormField label={t('profile.currentPassword')}>
              <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </FormField>
            <FormField label={t('profile.newPassword')}>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </FormField>

            <button
              onClick={handleSave} disabled={saving}
              style={{
                alignSelf: 'flex-start', padding: '10px 24px',
                background: 'var(--gradient-brand)', border: 'none', borderRadius: '8px',
                color: 'white', fontWeight: 600, fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? t('common.loading') : t('profile.saveChanges')}
            </button>
          </div>
        )}
      </ProfileSection>

      {/* Statistics */}
      <ProfileSection title={t('profile.statsSection')}>
        {collection.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{t('profile.noStats')}</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <StatCard value={collection.length}     label={t('profile.totalItems')} />
              <StatCard value={`${completionPct}%`}   label={t('profile.completionRate')} />
              {avgScore && <StatCard value={`★ ${avgScore}`} label={t('profile.avgScore')} />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* Distribución de puntuaciones */}
              <div>
                <ChartLabel>{t('profile.scoreDistribution')}</ChartLabel>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={scoreData} barSize={16}>
                    <XAxis dataKey="score" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-surface)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}
                      labelStyle={{ color: 'var(--color-text)' }}
                      itemStyle={{ color: '#7C3AED' }}
                    />
                    <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Content mix */}
              {typeData.length > 0 && (
                <div>
                  <ChartLabel>{t('profile.contentMix')}</ChartLabel>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={typeData} dataKey="value" cx="50%" cy="50%" outerRadius={60} paddingAngle={3}>
                        {typeData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend formatter={value => (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{value}</span>
                      )} />
                      <Tooltip
                        contentStyle={{ background: 'var(--color-surface)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', fontSize: '0.82rem' }}
                        itemStyle={{ color: 'var(--color-text)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </ProfileSection>
    </div>
  )
}

// Sub components and styles

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  background: 'rgba(124,58,237,0.07)',
  border: '1.5px solid rgba(124,58,237,0.25)', borderRadius: '8px',
  color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      marginBottom: '28px', padding: '24px',
      background: 'var(--color-surface)',
      border: '1px solid rgba(124,58,237,0.2)', borderRadius: '14px',
    }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ margin: '0 0 6px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{label}</p>
      {children}
    </div>
  )
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{
      padding: '14px 20px', minWidth: '110px',
      background: 'rgba(124,58,237,0.08)',
      border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px',
    }}>
      <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)' }}>{value}</p>
      <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{label}</p>
    </div>
  )
}

function ChartLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </p>
  )
}

// Re-export to avoid the TS error of import not used in UpdateUserRequest
import type { UpdateUserRequest } from '../services/userService'