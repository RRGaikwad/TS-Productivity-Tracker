import { useState, useEffect } from 'react';
import { parseDate } from 'chrono-node';
import { useTasks } from '../../../stores/TaskContext';
import { useProjects } from '../../../stores/ProjectContext';

export const QuickAddBar = () => {
  const [input, setInput] = useState('');
  const { addTask } = useTasks();
  const { projects } = useProjects();

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const inputEl = document.getElementById('quick-add-input');
        if (inputEl) inputEl.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Parse natural language date (e.g. "Buy groceries tomorrow at 5pm p!Work")
    let title = input;
    let dueDate: Date | undefined;
    let projectId: string = projects[0]?.id || '';

    // Check project tag p!ProjectName
    const projectMatch = input.match(/p!(\w+)/i);
    if (projectMatch) {
      const pName = projectMatch[1].toLowerCase();
      const matchedP = projects.find((p) => p.name.toLowerCase().includes(pName));
      if (matchedP) projectId = matchedP.id;
      title = title.replace(projectMatch[0], '');
    }

    // Chrono date parse
    const parsed = parseDate(title);
    if (parsed) {
      dueDate = parsed;
    }

    await addTask({
      title: title.trim(),
      projectId,
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-2 flex items-center gap-2">
        <span className="text-gray-400 pl-2 text-sm">⚡</span>
        <input
          id="quick-add-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Quick Add task (e.g. 'Submit report tomorrow at 3pm') — Press Ctrl+K"
          className="w-full text-xs bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
        />
        <button
          onClick={handleQuickAdd}
          disabled={!input.trim()}
          className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};
