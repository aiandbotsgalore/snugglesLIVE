export function generateDeviceId(): string {
  const stored = localStorage.getItem('device_id');
  if (stored) {
    return stored;
  }

  const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('device_id', deviceId);
  return deviceId;
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentSessionId(): string | null {
  return sessionStorage.getItem('current_session_id');
}

export function setCurrentSessionId(sessionId: string): void {
  sessionStorage.setItem('current_session_id', sessionId);
}

export function clearCurrentSession(): void {
  sessionStorage.removeItem('current_session_id');
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}
