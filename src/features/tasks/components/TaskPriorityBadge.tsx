import { PRIORITIES } from '../../../lib/constants';
import type { TaskPriority } from '../../../types';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export const TaskPriorityBadge = ({ priority }: TaskPriorityBadgeProps) => {
  const config = PRIORITIES[priority as keyof typeof PRIORITIES];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};
