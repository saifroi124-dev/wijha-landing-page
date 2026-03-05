import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { trackLead } from '../lib/pixel';

const SOURCES = ['business', 'students', 'freelancers'];

export function BookingForm({ source }) {
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  function validate() {
    const e = {};
    const t = fullname.trim();
    if (t.length < 2) e.fullname = 'الاسم يجب أن يكون حرفين على الأقل';
    const digits = (phone || '').replace(/\s/g, '').replace(/^\+/, '');
    if (digits.length < 8) e.phone = 'رقم الهاتف غير صحيح (8 أرقام على الأقل)';
    else if (!/^[0-9]+$/.test(digits)) e.phone = 'أدخل رقماً صحيحاً';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    const name = fullname.trim();
    const tel = phone.trim();

    const payload = { p_fullname: name, p_phone: tel, p_source: source };
    console.log('[BookingForm] Submit started', { source, payload });

    if (supabase && SOURCES.includes(source)) {
      setSubmitting(true);
      console.log('[BookingForm] Calling Supabase insert_lead...');
      const { data, error } = await supabase.rpc('insert_lead', payload);
      setSubmitting(false);
      if (error) {
        console.error('[BookingForm] Supabase error', { error, code: error.code, details: error.details });
        setSubmitError(error.message || 'فشل الحفظ. راجع Supabase.');
        return;
      }
      console.log('[BookingForm] Supabase success', { leadId: data });
    } else {
      console.log('[BookingForm] Supabase not configured or invalid source, skipping insert');
    }

    console.log('[BookingForm] Tracking Lead (Meta Pixel)', source);
    trackLead(source);
    setFullname('');
    setPhone('');
    setErrors({});
    setSuccessData({ name, phone: tel });
  }

  function formatPhoneForDisplay(tel) {
    if (!tel) return '';
    const digits = tel.replace(/\D/g, '').replace(/^216/, '');
    if (digits.length === 0) return tel;
    return digits.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
  }

  return (
    <div className="content-form">
      {successData && (
        <div className="success-overlay" role="dialog" aria-modal="true" aria-labelledby="success-title">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2 id="success-title" className="success-title">تم إرسال طلبك بنجاح</h2>
            <p className="success-text">سنتواصل معك قريباً.</p>
            <div className="success-details">
              <p><strong>الاسم:</strong> {successData.name}</p>
              <p><strong>الهاتف:</strong> <span dir="ltr">{formatPhoneForDisplay(successData.phone)}</span></p>
            </div>
            <button type="button" className="success-close" onClick={() => setSuccessData(null)}>
              حسناً
            </button>
          </div>
        </div>
      )}
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="fullname">الاسم الكامل</label>
          <input
            type="text"
            id="fullname"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className={'input' + (errors.fullname ? ' error' : '')}
            placeholder="أدخل اسمك الكامل"
            autoComplete="name"
          />
          {errors.fullname && <span className="field-error">{errors.fullname}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="phone">رقم الهاتف</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={'input' + (errors.phone ? ' error' : '')}
            placeholder="+XXX XXX XXX XXX"
            autoComplete="tel"
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>
        {submitError && <p className="field-error">{submitError}</p>}
        <button type="submit" className="cta" disabled={submitting}>
          {submitting ? 'جاري الإرسال...' : 'احجز مقعدي — 59 دينار'}
        </button>
      </form>
      <div className="pay-note">الدفع عبر D17 · Flouci · تحويل بنكي</div>
    </div>
  );
}
