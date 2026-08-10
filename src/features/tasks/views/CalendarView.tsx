import { useState } from 'react';
import { useTasks } from '../../../stores/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export const CalendarView = () => {
  const { tasks } = useTasks();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = Array.from({ length: 7 }).map((_, idx) => addDays(currentWeekStart, idx));

  return (
    <div className="space-y-4">
      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          className="text-xs font-semibold text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-gray-200"
        >
          ← Previous Week
        </button>

        <h3 className="font-bold text-sm text-gray-800">
          Week of {format(currentWeekStart, 'MMM dd, yyyy')}
        </h3>

        <button
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
          className="text-xs font-semibold text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-gray-200"
        >
          Next Week →
        </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayTasks = tasks.filter((t) => {
            if (!t.dueDate) return false;
            let dueDateObj: Date | null = null;
            if (t.dueDate instanceof Date) {
              dueDateObj = t.dueDate;
            } else if (typeof t.dueDate === 'object' && typeof (t.dueDate as any).seconds === 'number') {
              dueDateObj = new Date((t.dueDate as any).seconds * 1000);
            } else if (typeof t.dueDate === 'string' || typeof t.dueDate === 'number') {
              dueDateObj = new Date(t.dueDate);
            }
            if (!dueDateObj || isNaN(dueDateObj.getTime())) return false;
            return isSameDay(dueDateObj, day);
          });

          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`rounded-2xl p-3 border min-h-[300px] flex flex-col ${
                isToday ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="text-center mb-3 pb-2 border-b border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400">{format(day, 'EEE')}</p>
                <p className={`text-base font-extrabold ${isToday ? 'text-indigo-600' : 'text-gray-800'}`}>
                  {format(day, 'd')}
                </p>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto">
                {dayTasks.map((task) => (
                  <div key={task.id} className="text-xs">
                    <TaskCard task={task} />
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <p className="text-[10px] text-gray-300 text-center py-4">No due tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
