import { useEffect, useState } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import { FiArrowUpRight, FiCheck, FiCopy, FiX } from 'react-icons/fi';
import './campaign.css';

export default function CampaignCard({ campaign, onAction, onClose, onExpired, preview = false, compact = false }) {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => { setImageFailed(false); }, [campaign.imageUrl]);
  useEffect(() => {
    if (campaign.displayType !== 'clearance_countdown' || !campaign.endsAt) return;
    let expired = false;
    const update = () => {
      const seconds = Math.max(0, Math.ceil((Date.parse(campaign.endsAt) - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds && !expired) { expired = true; if (!preview) onExpired?.(); }
    };
    update(); const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [campaign.displayType, campaign.endsAt, onExpired, preview]);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    setError('');
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(campaign.couponCode);
      else {
        const field = document.createElement('textarea'); field.value = campaign.couponCode;
        field.style.position = 'fixed'; field.style.opacity = '0'; document.body.appendChild(field);
        try { field.select(); if (!document.execCommand('copy')) throw new Error('Copy failed'); }
        finally { field.remove(); }
      }
      setCopied(true);
    } catch { setError('Unable to copy. Select the code and copy it manually.'); }
  };
  const submit = async (event) => {
    event.preventDefault(); if (busy || preview) return;
    setBusy(true); setError('');
    try { await onAction?.(email.trim()); }
    catch (err) { setError(err.response?.data?.message || err.message || 'Please try again.'); }
    finally { setBusy(false); }
  };
  const newsletter = campaign.displayType === 'newsletter_signup';
  const chunks = [Math.floor(remaining / 86400), Math.floor(remaining % 86400 / 3600), Math.floor(remaining % 3600 / 60), remaining % 60];
  return <section className={`promo-card ${campaign.backgroundTheme === 'glass_light' ? 'promo-light' : 'promo-dark'} ${compact ? 'promo-compact' : ''}`}>
    <div className="promo-art" aria-hidden="true">
      {campaign.imageUrl && !imageFailed ? <img src={campaign.imageUrl} alt="" onError={() => setImageFailed(true)} /> : <div className="promo-art-fallback"><span>AC</span><p>Made by hand.<br />Chosen with heart.</p></div>}
      <div className="promo-art-caption">ART & CRAFT <span>FROM BHARAT</span></div>
    </div>
    <div className="promo-content">
      <button className="promo-close" type="button" aria-label="Close promotion" onClick={onClose} disabled={preview}><FiX /></button>
      <span className="promo-eyebrow">{newsletter ? 'A little inspiration, delivered' : campaign.displayType === 'clearance_countdown' ? 'A moment worth catching' : 'Something special for you'}</span>
      <h2 id="promo-title">{campaign.title || 'Your next favourite find'}</h2>
      {campaign.subtitle && <p id="promo-subtitle" className="promo-subtitle">{campaign.subtitle}</p>}
      {campaign.displayType === 'clearance_countdown' && <div className="promo-countdown" aria-label="Time remaining">
        {chunks.map((value, index) => <div key={index}><strong>{String(value).padStart(2, '0')}</strong><span>{['Days', 'Hours', 'Minutes', 'Seconds'][index]}</span></div>)}
      </div>}
      {campaign.couponCode && <button type="button" className={`promo-coupon ${copied ? 'is-copied' : ''}`} onClick={copy} disabled={preview} aria-label={`Copy coupon code ${campaign.couponCode}`}>
        <span><small>YOUR EXCLUSIVE CODE</small><strong>{campaign.couponCode}</strong></span>
        <span className="promo-copy-status" role="status">{copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy code</>}</span>
      </button>}
      <form onSubmit={submit} className="promo-form">
        {newsletter && <TextField label="Email address" type="email" required fullWidth value={email} disabled={busy || preview} autoComplete="email"
          onChange={(event) => setEmail(event.target.value)} slotProps={{ htmlInput: { maxLength: 254 } }} />}
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" fullWidth disabled={busy || preview} endIcon={<FiArrowUpRight />} className="promo-cta">{busy ? 'One moment...' : campaign.ctaText || 'Explore the collection'}</Button>
      </form>
      <p className="promo-footnote">{newsletter ? 'Craft, new collections and store offers in your inbox.' : 'Thoughtful pieces. A little extra joy.'}</p>
    </div>
  </section>;
}
