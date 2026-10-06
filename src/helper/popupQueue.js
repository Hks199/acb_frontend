export const POPUP_SESSION_KEY = 'acbPopupQueueV1';
export const POPUP_COMPLETED_KEY = 'acbCompletedPopupIdsV1';
export const INITIAL_DELAY = 5000;
export const NEXT_DELAY = 90000;
const read = (storage, key) => { try { return JSON.parse(storage?.getItem(key) || 'null'); } catch { return null; } };
const write = (storage, key, value) => { try { storage?.setItem(key, JSON.stringify(value)); } catch { /* Keep functioning when browser storage is unavailable. */ } };
const ids = (value) => Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string'))] : [];
export function createPopupQueue({ sessionStorage, localStorage, onChange, now = Date.now, setTimer = setTimeout, clearTimer = clearTimeout }) {
  const saved = read(sessionStorage, POPUP_SESSION_KEY);
  const state = {
    startedAt: Number.isFinite(saved?.startedAt) && saved.startedAt >= 0 ? Math.min(saved.startedAt, now()) : now(),
    lastPopupDismissedAt: Number.isFinite(saved?.lastPopupDismissedAt) && saved.lastPopupDismissedAt >= 0 ? Math.min(saved.lastPopupDismissedAt, now()) : null,
    nextQueueIndex: Number.isSafeInteger(saved?.nextQueueIndex) && saved.nextQueueIndex >= 0 ? saved.nextQueueIndex : 0,
    completedPopupIds: ids([...ids(saved?.completedPopupIds), ...ids(read(localStorage, POPUP_COMPLETED_KEY))]),
    dismissedPopupIds: ids(saved?.dismissedPopupIds),
    activePopupId: typeof saved?.activePopupId === 'string' ? saved.activePopupId : null,
  };
  let campaigns = [], timer = null, disposed = false;
  const persist = () => write(sessionStorage, POPUP_SESSION_KEY, state);
  const cancel = () => { if (timer !== null) clearTimer(timer); timer = null; };
  const eligible = (campaign) => campaign.isActive && !state.completedPopupIds.includes(campaign._id) &&
    !state.dismissedPopupIds.includes(campaign._id) && (!campaign.endsAt || Date.parse(campaign.endsAt) > now());
  const next = () => campaigns.find(eligible);
  const schedule = () => {
    cancel();
    if (disposed || state.activePopupId || !next()) return;
    const due = state.lastPopupDismissedAt === null ? state.startedAt + INITIAL_DELAY : state.lastPopupDismissedAt + NEXT_DELAY;
    timer = setTimer(() => {
      timer = null;
      if (disposed || state.activePopupId) return;
      const campaign = next();
      if (!campaign) return;
      state.activePopupId = campaign._id;
      state.nextQueueIndex = campaigns.findIndex((item) => item._id === campaign._id);
      persist(); onChange(campaign);
    }, Math.max(0, due - now()));
  };
  const dismiss = (converted = false) => {
    if (disposed || !state.activePopupId) return;
    const id = state.activePopupId;
    if (converted) {
      state.completedPopupIds = ids([...state.completedPopupIds, ...ids(read(localStorage, POPUP_COMPLETED_KEY)), id]);
      write(localStorage, POPUP_COMPLETED_KEY, state.completedPopupIds);
    }
    state.dismissedPopupIds = ids([...state.dismissedPopupIds, id]);
    state.nextQueueIndex = Math.max(0, campaigns.findIndex((item) => item._id === id) + 1);
    state.activePopupId = null; state.lastPopupDismissedAt = now();
    persist(); onChange(null); schedule();
  };
  persist();
  return {
    setCampaigns: (items) => {
      if (disposed) return;
      campaigns = [...new Map((Array.isArray(items) ? items : []).filter((item) => typeof item?._id === 'string' && item.isActive).map((item) => [item._id, item])).values()]
        .sort((a, b) => a.priority_order - b.priority_order || String(a.createdAt || '').localeCompare(String(b.createdAt || '')) || a._id.localeCompare(b._id));
      state.completedPopupIds = ids([...state.completedPopupIds, ...ids(read(localStorage, POPUP_COMPLETED_KEY))]);
      if (state.activePopupId) {
        const current = campaigns.find((item) => item._id === state.activePopupId);
        if (current && eligible(current)) { onChange(current); persist(); return; }
        dismiss(); return;
      }
      persist(); schedule();
    },
    dismiss,
    // A late signup response must never dismiss a different, newer popup.
    complete: (id) => {
      if (state.activePopupId === id && !disposed) { dismiss(true); return; }
      state.completedPopupIds = ids([...state.completedPopupIds, ...ids(read(localStorage, POPUP_COMPLETED_KEY)), id]);
      write(localStorage, POPUP_COMPLETED_KEY, state.completedPopupIds);
      // An old view may finish a signup after a newer view has started its queue.
      if (disposed) return;
      persist(); schedule();
    },
    getState: () => ({ ...state, completedPopupIds: [...state.completedPopupIds], dismissedPopupIds: [...state.dismissedPopupIds] }),
    dispose: () => { disposed = true; cancel(); },
  };
}
