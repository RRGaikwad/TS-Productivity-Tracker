import { useState } from 'react';
import { useProjects } from '../../../stores/ProjectContext';
import { ProjectForm } from './ProjectForm';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from '../../../components/common';
import { usePro } from '../../../hooks/usePro';
import { UpgradeModal } from '../../../components/common';

export const ProjectList = () => {
  const { projects, loading } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const { isPro } = usePro();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <button
          onClick={() => {
            if (!isPro && projects.length >= 3) {
              setShowUpgradeModal(true);
            } else {
              setShowForm(!showForm);
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <ProjectForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started organizing your tasks."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Unlimited Projects"
      />
    </div>
  );
};
