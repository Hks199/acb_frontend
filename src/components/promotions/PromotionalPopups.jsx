import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, Grow } from '@mui/material';
import { useNavigate } from 'react-router';
import { axiosClient } from '../../utils/axiosClient';
import { createPopupQueue } from '../../helper/popupQueue';
import CampaignCard from './CampaignCard';

const storage = (name) => { try { return window[name]; } catch { return null; } };
export default function PromotionalPopups() {
  const [campaign, setCampaign] = useState(null);
  const queue = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const manager = createPopupQueue({ sessionStorage: storage('sessionStorage'), localStorage: storage('localStorage'), onChange: setCampaign });
    queue.current = manager;
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending) return;
      pending = true;
      try {
        const response = await axiosClient.get('promotional-popups/active', { signal: controller.signal });
        if (!controller.signal.aborted && Array.isArray(response.data)) manager.setCampaigns(response.data);
      } catch { /* Retry in the background without interrupting the shopper. */ }
      finally { pending = false; }
    };
    refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      controller.abort(); window.clearInterval(interval); window.removeEventListener('focus', refresh);
      manager.dispose(); if (queue.current === manager) queue.current = null;
    };
  }, []);
  const close = useCallback(() => queue.current?.dismiss(), []);
  const action = async (email) => {
    const current = campaign;
    const manager = queue.current;
    if (!current || !manager) return;
    let target = null;
    if (current.ctaUrl) {
      if (current.ctaUrl.startsWith('/') && !current.ctaUrl.startsWith('//') && !current.ctaUrl.includes('\\') && [...current.ctaUrl].every((character) => character.charCodeAt(0) > 32)) target = { internal: true, href: current.ctaUrl };
      else {
        const url = new URL(current.ctaUrl);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('This campaign link is unavailable.');
        target = { internal: false, href: url.href };
      }
    } else if (current.displayType !== 'newsletter_signup') throw new Error('This campaign link is unavailable.');
    if (current.displayType === 'newsletter_signup') {
      const response = await axiosClient.post(`promotional-popups/${current._id}/subscribe`, { email });
      if (!response.data?.success) throw new Error('Unable to subscribe. Please try again.');
    }
    if (queue.current !== manager) { manager.complete(current._id); return; }
    const stillOpen = manager.getState().activePopupId === current._id;
    manager.complete(current._id);
    if (!stillOpen || !target) return;
    if (target.internal) navigate(target.href);
    else window.location.assign(target.href);
  };
  return <Dialog open={!!campaign} onClose={close} maxWidth="md" fullWidth aria-labelledby="promo-title" aria-describedby={campaign?.subtitle ? 'promo-subtitle' : undefined}
    slots={{ transition: Grow }} slotProps={{ transition: { timeout: 300 }, paper: { className: 'promo-dialog', sx: { bgcolor: 'transparent', backgroundImage: 'none', boxShadow: 'none', m: { xs: 2, sm: 4 }, width: 'calc(100% - 32px)', overflow: 'auto' } }, backdrop: { sx: { backgroundColor: 'rgba(8,18,18,.6)', backdropFilter: 'blur(8px)' } } }}>
    {campaign && <CampaignCard key={campaign._id} campaign={campaign} onClose={close} onExpired={close} onAction={action} />}
  </Dialog>;
}
