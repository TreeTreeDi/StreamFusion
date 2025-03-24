/**
 * 格式化观众数量，如果超过1000则显示为K
 * 例如: 1500 -> 1.5K
 */
export const formatViewerCount = (count: number): string => {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return count.toString();
  }
};

/**
 * 格式化时间差
 * 例如: '2小时前', '3天前'
 */
export const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  // 转换为秒
  const diffSec = Math.floor(diffMs / 1000);
  
  // 小于1分钟
  if (diffSec < 60) {
    return '刚刚';
  }
  
  // 分钟
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}分钟前`;
  }
  
  // 小时
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}小时前`;
  }
  
  // 天
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return `${diffDay}天前`;
  }
  
  // 月
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) {
    return `${diffMonth}个月前`;
  }
  
  // 年
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear}年前`;
}; 
