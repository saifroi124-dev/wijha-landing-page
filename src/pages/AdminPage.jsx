import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SOURCE_LABELS = { business: 'أصحاب المشاريع', students: 'الطلاب', freelancers: 'الفريلانسرز' };
const STATUS_LABELS = { new: 'جديد', working_on: 'قيد العمل', ended: 'منتهي' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ar-TN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [leads, setLeads] = useState([]);
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loadError, setLoadError] = useState('');
  const [copied, setCopied] = useState(false);

  const adminEmail = session?.user?.email ?? '';
  const allowedAdminsSql =
    adminEmail &&
    `INSERT INTO public.allowed_admins (user_id)
SELECT id FROM auth.users WHERE email = '${adminEmail.replace(/'/g, "''")}' LIMIT 1
ON CONFLICT (user_id) DO NOTHING;`;

  async function copyAllowedAdminsSql() {
    if (!allowedAdminsSql) return;
    await navigator.clipboard.writeText(allowedAdminsSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !supabase) return;
    let q = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (filterSource) q = q.eq('source', filterSource);
    if (filterStatus) q = q.eq('status', filterStatus);
    q.then(({ data, error }) => {
      if (error) setLoadError(error.message);
      else {
        setLoadError('');
        setLeads(data || []);
      }
    });
  }, [session, filterSource, filterStatus]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    if (!supabase) {
      setLoginError('Supabase غير مُكوّن. راجع .env');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  }

  async function handleLogout() {
    await supabase?.auth.signOut();
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) setLoadError(error.message);
    else setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  if (loading) return <div className="admin-loading">جاري التحميل...</div>;
  if (!supabase) {
    return (
      <div className="admin-login-wrap">
        <p className="error-msg">Supabase غير مُكوّن. راجع .env</p>
      </div>
    );
  }
  if (!session) {
    return (
      <div className="admin-login-wrap">
        <div className="login-box">
          <h1>تسجيل الدخول</h1>
          <p className="login-hint">للوحة إدارة الطلبات</p>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="admin-email">البريد الإلكتروني</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="admin-password">كلمة المرور</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && <p className="error-msg">{loginError}</p>}
            <button type="submit" className="btn btn-primary">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>الطلبات — ورشة الذكاء الاصطناعي</h1>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>تسجيل الخروج</button>
      </header>
      <div className="toolbar">
        <label>الصفحة:</label>
        <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
          <option value="">الكل</option>
          <option value="business">أصحاب المشاريع</option>
          <option value="students">الطلاب</option>
          <option value="freelancers">الفريلانسرز</option>
        </select>
        <label>الحالة:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">الكل</option>
          <option value="new">جديد</option>
          <option value="working_on">قيد العمل</option>
          <option value="ended">منتهي</option>
        </select>
        <span className="count">{leads.length} طلب</span>
      </div>
      {loadError && <p className="error-msg">{loadError}</p>}
      {!loadError && leads.length === 0 && (
        <div className="admin-hint admin-hint-block">
          <p className="admin-hint-title">الطلبات تُحفظ لكن لا تظهر لأنك تحتاج إضافتك في جدول المسموح لهم.</p>
          <p>نفّذ هذا الأمر في Supabase → SQL Editor ثم حدّث الصفحة (F5):</p>
          <pre className="admin-hint-sql">{allowedAdminsSql || "— جاري التحميل..."}</pre>
          {allowedAdminsSql && (
            <button type="button" className="btn btn-primary admin-hint-copy" onClick={copyAllowedAdminsSql}>
              {copied ? 'تم النسخ ✓' : 'نسخ الأمر'}
            </button>
          )}
        </div>
      )}
      <div className="table-wrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>الصفحة</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr><td colSpan={5}>لا توجد طلبات.</td></tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{formatDate(lead.created_at)}</td>
                <td>{lead.fullname}</td>
                <td>{lead.phone}</td>
                <td><span className={'source-badge ' + lead.source}>{SOURCE_LABELS[lead.source]}</span></td>
                <td>
                  <select
                    className={'status-select status-' + lead.status}
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                  >
                    <option value="new">{STATUS_LABELS.new}</option>
                    <option value="working_on">{STATUS_LABELS.working_on}</option>
                    <option value="ended">{STATUS_LABELS.ended}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
