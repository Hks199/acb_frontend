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
  const [announcements, setAnnouncements] = useState([]);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || document.visibilityState === 'hidden') return;
      pending = true;
      try {
        const response = await axiosClient.get('announcement/active', { signal: controller.signal });
        if (!controller.signal.aborted) {
          // Accept the previous single-document response during rolling deployments.
          const data = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];
          const active = data.filter((item) => item?.isActive && typeof item.text === 'string' && item.text.trim());
          setAnnouncements(active);
          setIndex((previous) => previous % Math.max(1, active.length));
        }
      } catch {
        // Hide a stale announcement when its visibility cannot be confirmed.
        if (!controller.signal.aborted) { setAnnouncements([]); setIndex(0); }
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
  useEffect(() => {
    if (announcements.length < 2) return;
    const interval = window.setInterval(() => {
      setIndex((previous) => (previous + 1) % announcements.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [announcements.length]);

  if (!announcements.length) return null;
  return <div className="announcement-rotator" aria-label="Store announcements">
    {announcements.map((announcement, position) => {
      const current = position === index;
      const href = safeLink(announcement.targetUrl);
      const Container = href ? 'a' : 'div';
      return <Container key={announcement._id || position} href={href}
        aria-hidden={!current} inert={!current} tabIndex={href && !current ? -1 : undefined}
        className={`announcement-bar announcement-slide ${current ? 'is-active' : ''} ${styles[announcement.badge?.type] || styles.info}`}>
        {announcement.badge?.text && <span className="announcement-badge">{announcement.badge.text}</span>}
        <span className="announcement-text">{announcement.text}</span>
      </Container>;
    })}
  </div>;
}
