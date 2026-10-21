// API pública da feature "today", usada por outras features.
export {
  useDayLog,
  markTaskDone,
  setMinimum,
  setRecovery,
  isPhysicalTask,
  dayStatus,
  isDayComplete,
  type DayStatus,
} from './dayLog';
export { buildDayTasks, type DayTask } from './tasks';
export { STATUS_COLORS } from './WeekStrip';
