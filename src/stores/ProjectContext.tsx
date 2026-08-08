import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToProjects, createProject, updateProject, deleteProject } from '../services/firebase/firestore';
import { getProjectsFromDB, addProjectToDB, updateProjectInDB, deleteProjectFromDB } from '../services/indexeddb';
import { queueSyncOperation } from '../services/indexeddb/sync';
import type { Project } from '../types';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editProject: (id: string, updates: Partial<Project>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Load from IndexedDB first
    getProjectsFromDB(user.uid).then((localProjects) => {
      setProjects(localProjects);
    });

    // Subscribe to Firestore
    const unsubscribe = subscribeToProjects(user.uid, (firestoreProjects) => {
      setProjects(firestoreProjects);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>) => {
    if (!user) return;

    const tempId = `temp-${Date.now()}`;
    const tempProject: any = {
      ...projectData,
      ownerId: user.uid,
      id: tempId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optimistic update
    setProjects((prev) => [...prev, tempProject]);

    try {
      // Add to IndexedDB
      await addProjectToDB(tempProject);

      // Add to Firestore
      const firestoreId = await createProject({ ...projectData, ownerId: user.uid });

      // Update local state with Firestore ID
      setProjects((prev) =>
        prev.map((p: any) => (p.id === tempId ? { ...p, id: firestoreId } : p))
      );

      // Update IndexedDB with Firestore ID
      await updateProjectInDB(tempId, { id: firestoreId });
      await deleteProjectFromDB(tempId);
      await addProjectToDB({ ...tempProject, id: firestoreId });
    } catch (error) {
      console.error('Failed to add project:', error);
      // Revert on error
      setProjects((prev) => prev.filter((p: any) => p.id !== tempId));
      await deleteProjectFromDB(tempId);
    }
  };

  const editProject = async (id: string, updates: Partial<Project>) => {
    if (!user) return;

    // Optimistic update
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    try {
      // Update IndexedDB
      await updateProjectInDB(id, updates);

      // Update Firestore
      await updateProject(id, updates);

      // Queue sync operation
      await queueSyncOperation('projects', 'update', id, updates);
    } catch (error) {
      console.error('Failed to update project:', error);
      // Revert on error
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...(updates as any) } : p)));
    }
  };

  const removeProject = async (id: string) => {
    if (!user) return;

    const projectToDelete = projects.find((p) => p.id === id);

    // Optimistic update
    setProjects((prev) => prev.filter((p) => p.id !== id));

    try {
      // Delete from IndexedDB
      await deleteProjectFromDB(id);

      // Delete from Firestore
      await deleteProject(id);

      // Queue sync operation
      await queueSyncOperation('projects', 'delete', id, { id });
    } catch (error) {
      console.error('Failed to delete project:', error);
      // Revert on error
      if (projectToDelete) {
        setProjects((prev) => [...prev, projectToDelete]);
      }
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, loading, addProject, editProject, removeProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
