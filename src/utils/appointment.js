import dayjs from 'dayjs';

// 取消预约截止：必须早于预约开始时间 30 分钟
const CANCEL_DEADLINE_MINUTES = 30;

/**
 * 是否允许取消预约（必须早于预约开始时间 30 分钟）
 * @param {Object} order 订单（读取 AllowRefundFlag / OrderStatus / AdmitDate / AdmitRange）
 * @param {import('dayjs').Dayjs} [now] 当前时间，默认取实时时间；显示层将来可传入响应式时间以驱动重算
 * @returns {boolean}
 */
export function canCancelOrder(order, now = dayjs()) {
  if (order.AllowRefundFlag !== 'Y' || order.OrderStatus !== 'normal') {
    return false;
  }
  // 开始时间缺失时 fail-open，沿用现有行为
  const admitStart = order.AdmitRange?.split('-')[0];
  if (!admitStart) {
    return true;
  }
  const deadline = dayjs(`${order.AdmitDate} ${admitStart}`).subtract(CANCEL_DEADLINE_MINUTES, 'minute');
  return now.isBefore(deadline);
}
