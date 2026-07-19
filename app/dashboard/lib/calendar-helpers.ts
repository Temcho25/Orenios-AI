import type { EventCategory } from "../../lib/event-category";

export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

export function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

export function getCalendarDays(currentMonth: Date): CalendarDay[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const mondayBasedStartDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();
  const previousMonthLastDay = new Date(year, month, 0).getDate();

  const calendarDays: CalendarDay[] = [];

  for (
    let index = mondayBasedStartDay - 1;
    index >= 0;
    index -= 1
  ) {
    calendarDays.push({
      date: new Date(
        year,
        month - 1,
        previousMonthLastDay - index
      ),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarDays.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  let nextMonthDay = 1;

  while (calendarDays.length < 42) {
    calendarDays.push({
      date: new Date(year, month + 1, nextMonthDay),
      isCurrentMonth: false,
    });

    nextMonthDay += 1;
  }

  return calendarDays;
}

export function formatTime(time: string | null) {
  if (!time) {
    return "All day";
  }

  return time.slice(0, 5);
}

export function getCategoryClasses(category: EventCategory) {
  switch (category) {
    case "Work":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20";
    case "Health":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20";
    case "Fitness":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20";
    case "Other":
      return "bg-surface-strong text-foreground/50 border-muted-border";
    default:
      return "bg-accent-violet/10 text-accent-violet border-accent-violet/20";
  }
}

export function getCategoryDot(category: EventCategory) {
  switch (category) {
    case "Work":
      return "bg-blue-500";
    case "Health":
      return "bg-emerald-500";
    case "Fitness":
      return "bg-orange-500";
    case "Other":
      return "bg-gray-300";
    default:
      return "bg-violet-500";
  }
}
