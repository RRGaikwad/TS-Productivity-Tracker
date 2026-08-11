import { useState } from 'react';
import { parseDate } from 'chrono-node';
import { useTasks } from '../../../stores/TaskContext';
import { useGoals } from '../../../stores/GoalContext';

export const QuickAddBar = () => {
  const [input, setInput] = useState('');
  const { addTask } = useTasks();
  const { goals } = useGoals();

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let title = input;
    let dueDate: Date | undefined;
    let goalId: string | undefined;

    // Check goal tag g!GoalName
    const goalMatch = input.match(/g!(\w+)/i);
    if (goalMatch) {
      const gName = goalMatch[1].toLowerCase();
      const matchedGoal = goals.find((g) => g.title.toLowerCase().includes(gName));
      if (matchedGoal) goalId = matchedGoal.id;
      title = title.replace(goalMatch[0], '');
    }

    // Chrono date parse
    const parsed = parseDate(title);
    if (parsed) {
      dueDate = parsed;
    }

    await addTask({
      title: title.trim(),
      goalId,
      priority: 'medium',
      status: 'todo',
      dueDate: dueDate ? ({ seconds: Math.floor(dueDate.getTime() / 1000), nanoseconds: 0 } as any) : undefined,
      reminderEnabled: false,
      order: Date.now(),
    });

    setInput('');
  };

  return (
    <div className="relative">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-2 flex items-center gap-2">
        <span className="text-amber-500 pl-2 text-sm">⚡</span>
        <input
          id="quick-add-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Quick Add task (e.g. 'Submit report tomorrow g!Launch') — Press Enter"
          className="w-full text-xs bg-transparent focus:outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button
          onClick={handleQuickAdd}
          disabled={!input.trim()}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 transition-all shadow-sm shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  );
};
