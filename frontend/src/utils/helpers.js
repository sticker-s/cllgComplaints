export function getStatusBadge(status) {
  const map = {
    'pending': { cls: 'badge-pending', label: '⏳ Pending' },
    'in-progress': { cls: 'badge-progress', label: '🔄 In Progress' },
    'resolved': { cls: 'badge-resolved', label: '✅ Resolved' },
    'rejected': { cls: 'badge-rejected', label: '❌ Rejected' },
  }
  return map[status] || { cls: '', label: status }
}

export function getPriorityBadge(priority) {
  const map = {
    'low': { cls: 'badge-low', label: '🔵 Low' },
    'medium': { cls: 'badge-medium', label: '🟡 Medium' },
    'high': { cls: 'badge-high', label: '🔴 High' },
    'urgent': { cls: 'badge-urgent', label: '🚨 Urgent' },
  }
  return map[priority] || { cls: '', label: priority }
}

export function getPriorityColor(priority) {
  const map = {
    'low': '#6b7280',
    'medium': '#f59e0b',
    'high': '#ef4444',
    'urgent': '#dc2626',
  }
  return map[priority] || '#6b7280'
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}
