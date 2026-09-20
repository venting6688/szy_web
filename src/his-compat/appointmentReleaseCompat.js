/**
 * ⚠️ 临时 HIS Bug 兼容逻辑 —— 预约挂号 / 医生排班放号日期规则（2026-09-17 ~ 2026-09-24）
 *
 * 背景：HIS 侧故障，特殊期间不使用「今天 + 未来 6 天」的日期规则，
 *       改为从 2026-09-25 开始展示，并每天 20:00 释放下一天。
 *
 * 生效时间：2026-09-17 00:00:00 ~ 2026-09-24 23:59:59
 *          2026-09-25 00:00:00 起本模块自动失效，恢复原有正常逻辑。
 *
 * 规则（k = 今天与 9/17 的自然日差，9/17 => k=0 … 9/24 => k=7）：
 *   - 今晚 20:00 正式放号的日期 = 9/25 + k
 *   - 已放号日期 = 9/25 … (9/25 + k - 1)，20:00 起把 9/25 + k 并入
 *   - 9/25 + k 在 19:50 起以「待放号」出现（9/17 当天尚无已放号日期，全天展示待放号，
 *     避免日期条为空）
 *   - 已放号日期点击走原有排班接口；待放号日期只展示到 20:00 的倒计时，不请求排班接口
 *   - 19:50 / 20:00 / 次日 00:00 的状态切换复用 useAppointmentData 中已有的边界定时器，
 *     页面不刷新也会自动完成；倒计时目标（当天 20:00）同样复用原有实现
 *
 * 生效页面：预约挂号（/appointment、/h5/appointment）与医生排班（/schedule、/h5/schedule），
 *          两者共用同一日期条；当日挂号页（appointment-today）无日期条，不受影响
 *
 * ⚠️ 删除步骤（临时需求结束后整体移除）：
 *   1. 删除本文件（src/his-compat 目录）及 import；
 *   2. 删除 src/composables/useAppointmentData.js 中所有带 `HIS-COMPAT` 标记的代码
 *      （import / hisCompat / hisCompatActive / dates 与 pendingDate 的分支 / return 字段）；
 *   3. 删除 src/views/appointment/Appointment.vue 中 `hisCompatActive` 解构、
 *      `date-bar--his-compat` 类名及其样式；
 *   4. 其余改动（currentDate 取日期条首日、跨天 watcher 监听整个日期条、
 *      loadDoctors 待放号兜底）为通用等价修正，可保留。
 */
import dayjs from 'dayjs';

// —— 特殊期参数（如需临时调整，只改这里）——
const COMPAT_START = '2026-09-17 00:00:00';
const COMPAT_END = '2026-09-25 00:00:00'; // 左闭右开：9/25 00:00 起恢复正常逻辑
const FIRST_SHOW_DATE = '2026-09-25'; // 特殊期展示的首个日期
const PENDING_FROM = { hour: 19, minute: 50 }; // 待放号出现时刻
const RELEASE_AT = { hour: 20, minute: 0 }; // 正式放号时刻
const COMPAT_TYPES = ['appointment', 'schedule']; // 生效页面类型（有日期条的页面）

const DATE_FORMAT = 'YYYY-MM-DD';

// 取某天的指定时刻（dayjs 实例不可变，setter 返回新实例）
function atTime(day, time) {
  return day.hour(time.hour).minute(time.minute).second(0).millisecond(0);
}

/**
 * 当前是否处于特殊期（含页面类型判断）
 * @param {number|Date|string} now 当前时间
 * @param {string} type 页面类型：appointment / appointment-today / schedule
 * @returns {boolean}
 */
export function isHisCompatActive(now, type) {
  if (!COMPAT_TYPES.includes(type)) return false;
  const t = dayjs(now);
  return !t.isBefore(dayjs(COMPAT_START)) && t.isBefore(dayjs(COMPAT_END));
}

/**
 * 特殊期的日期条状态
 * @param {number|Date|string} now 当前时间
 * @param {string} type 页面类型
 * @returns {{ dates: string[], releasedDates: string[], pendingDate: string|null }|null}
 *          返回 null 表示不在特殊期，调用方应走原有正常逻辑
 */
export function getHisCompatDateState(now, type) {
  if (!isHisCompatActive(now, type)) return null;

  const t = dayjs(now);
  // 与 9/17 的自然日差：9/17 => 0 … 9/24 => 7
  const dayIndex = t.startOf('day').diff(dayjs(COMPAT_START).startOf('day'), 'day');
  // 今晚 20:00 正式放号的日期
  const tonightReleaseDate = dayjs(FIRST_SHOW_DATE).add(dayIndex, 'day');
  // 是否已到今晚放号时刻（20:00 整起算已放号）
  const isReleased = t.valueOf() >= atTime(t, RELEASE_AT).valueOf();
  // 已放号日期数量：20:00 前为 k 个，20:00 起把今晚的日期并入为 k + 1 个
  const releasedCount = dayIndex + (isReleased ? 1 : 0);

  const releasedDates = Array.from({ length: releasedCount }, (_, i) =>
    dayjs(FIRST_SHOW_DATE).add(i, 'day').format(DATE_FORMAT),
  );

  // 待放号日期：19:50 起出现、20:00 转正；9/17 当天没有任何已放号日期，全天展示避免日期条为空
  const pendingDate =
    !isReleased && (releasedCount === 0 || t.valueOf() >= atTime(t, PENDING_FROM).valueOf())
      ? tonightReleaseDate.format(DATE_FORMAT)
      : null;

  return {
    dates: pendingDate ? [...releasedDates, pendingDate] : releasedDates,
    releasedDates,
    pendingDate,
  };
}
