export const formatDate = (date: string): string => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (dateTime: string): string => {
  if (!dateTime) return '';
  const d = new Date(dateTime);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatMoney = (amount: number): string => {
  if (amount === undefined || amount === null) return '¥0';
  return `¥${amount.toLocaleString('zh-CN')}`;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '健康': '#2E8B57',
    '训练中': '#1976D2',
    '休息': '#FF8C00',
    '治疗中': '#D32F2F',
    '已完成': '#2E8B57',
    '进行中': '#1976D2',
    '待处理': '#FF8C00',
    '可预约': '#2E8B57',
    '已满员': '#D32F2F',
    '已取消': '#86909C',
    '待上课': '#1976D2',
    '正常': '#2E8B57',
    '冻结': '#FF8C00',
    '过期': '#86909C',
    '有效': '#2E8B57',
    '已用完': '#D32F2F',
    '已支付': '#2E8B57',
    '待支付': '#FF8C00',
    '已退款': '#86909C',
    '已占用': '#2E8B57',
    '空置': '#1976D2',
    '维修中': '#D32F2F',
    '可租赁': '#2E8B57',
    '已租出': '#FF8C00',
    '报名中': '#2E8B57',
    '已截止': '#86909C',
    '已结束': '#86909C',
    '在职': '#2E8B57',
    '休假': '#FF8C00',
    '离职': '#86909C',
  };
  return colorMap[status] || '#86909C';
};

export const getStatusBgColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '健康': 'rgba(46, 139, 87, 0.1)',
    '训练中': 'rgba(25, 118, 210, 0.1)',
    '休息': 'rgba(255, 140, 0, 0.1)',
    '治疗中': 'rgba(211, 47, 47, 0.1)',
    '已完成': 'rgba(46, 139, 87, 0.1)',
    '进行中': 'rgba(25, 118, 210, 0.1)',
    '待处理': 'rgba(255, 140, 0, 0.1)',
  };
  return colorMap[status] || 'rgba(134, 144, 156, 0.1)';
};

export const getLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    '普通会员': '#8D6E63',
    '银卡会员': '#C0C0C0',
    '金卡会员': '#FFD700',
    '钻石会员': '#B9F2FF',
  };
  return colorMap[level] || '#8D6E63';
};

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
