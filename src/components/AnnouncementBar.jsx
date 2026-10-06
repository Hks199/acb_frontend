import { useEffect, useState } from 'react';
import { axiosClient } from '../utils/axiosClient';

const styles = {
  offer: 'bg-emerald-600 text-white',
  alert: 'bg-rose-600 text-white',
  new_launch: 'bg-blue-600 text-white',
  info: 'bg-neutral-800 text-white',
};
const safeLink = (value) => {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
};
export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || document.visibilityState === 'hidden') return;
      pending = true;
      try {
        const response = await axiosClient.get('announcement/active', { signal: controller.signal });
        if (!controller.signal.aborted) setAnnouncement(response.data?.isActive ? response.data : null);
      } catch {
        // Hide a stale announcement when its visibility cannot be confirmed.
        if (!controller.signal.aborted) setAnnouncement(null);
      } finally { pending = false; }
    };
    refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort(); window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  if (!announcement?.isActive || !announcement.text) return null;
  const href = safeLink(announcement.targetUrl);
  const Container = href ? 'a' : 'div';
  return <Container href={href} aria-label={href ? undefined : 'Store announcement'}
    className={`announcement-bar ${styles[announcement.badge?.type] || styles.info}`}>
    {announcement.badge?.text && <span className="announcement-badge">{announcement.badge.text}</span>}
    <span className="announcement-text">{announcement.text}</span>
  </Container>;
}
