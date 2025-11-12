'use client';

import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import TaskCreation from './TaskCreation';
import NotificationModal from './NotificationModal';

interface Task {
  id: number;
  taskname: string;
  status: string;
  project_id: number;
}

interface Project {
  id: number;
  title: string;
  deadline: string;
  clientname: string;
  created_at: string;
}

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<{ [key: number]: Task[] }>({});
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    projectId: number;
    projectTitle: string;
  } | null>(null);
  const [isSubmittingNotification, setIsSubmittingNotification] = useState(false);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
      data.forEach((project) => {
        fetchTasks(project.id);
      });
    }
  };

  const fetchTasks = async (projectId: number) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('id', { ascending: true });

    if (error) {
      setTasks((prev) => ({ ...prev, [projectId]: [] }));
    } else if (data) {
      setTasks((prev) => ({ ...prev, [projectId]: data }));
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string, projectId: number) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (!error) {
      fetchTasks(projectId);
    }
  };

  const deleteTask = async (taskId: number, projectId: number) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      fetchTasks(projectId);
    }
  };

  const deleteProject = async (projectId: number) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (!error) {
      fetchProjects();
      const newExpanded = new Set(expandedProjects);
      newExpanded.delete(projectId);
      setExpandedProjects(newExpanded);
    }
  };

  const handleNotifyClick = (projectId: number, projectTitle: string) => {
    setNotificationModal({ isOpen: true, projectId, projectTitle });
  };

  const handleNotificationSubmit = async (email: string) => {
    if (!notificationModal) return;

    setIsSubmittingNotification(true);

    try {
      const project = projects.find((p) => p.id === notificationModal.projectId);
      if (!project) throw new Error('Project not found');

      const { error: dbError } = await supabase.from('notifications').insert([
        {
          project_id: notificationModal.projectId,
          email: email,
          notification_date: new Date(
            new Date(project.deadline).getTime() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ]);

      if (dbError) throw dbError;

      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          projectTitle: project.title,
          deadline: project.deadline,
          clientName: project.clientname,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      alert('Notification set successfully! You will receive an email 3 days before the deadline.');
      setNotificationModal(null);
    } catch (error) {
      alert('Failed to set notification. Please try again.');
    } finally {
      setIsSubmittingNotification(false);
    }
  };

  const toggleProject = async (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
      await fetchTasks(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();
      setLoading(false);
    };
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'done':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100">
        <p className="text-gray-500 text-lg">No projects yet. Create your first project above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const isExpanded = expandedProjects.has(project.id);
        const projectTasks = tasks[project.id] || [];

        return (
          <div
            key={project.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div
              onClick={() => toggleProject(project.id)}
              className="px-6 py-5 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {projectTasks.length} tasks
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {project.clientname}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(project.deadline)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotifyClick(project.id, project.title);
                    }}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                    title="Notify me of deadline"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50">
                <div className="px-6 py-5 space-y-4">
                  <TaskCreation
                    projectId={project.id}
                    onTaskCreated={() => fetchTasks(project.id)}
                  />

                  {projectTasks.length > 0 ? (
                    <div className="space-y-2 mt-4">
                      {projectTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <span className="text-gray-900 font-medium flex-1">{task.taskname}</span>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value, project.id)}
                            className={`px-3 py-1.5 rounded-lg border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getStatusColor(task.status)}`}
                          >
                            <option value="todo">Todo</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                          <button
                            onClick={() => deleteTask(task.id, project.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Delete task"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">No tasks yet. Add your first task above.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {notificationModal && (
        <NotificationModal
          isOpen={notificationModal.isOpen}
          onClose={() => setNotificationModal(null)}
          onSubmit={handleNotificationSubmit}
          projectTitle={notificationModal.projectTitle}
          isSubmitting={isSubmittingNotification}
        />
      )}
    </div>
  );
};

export default ProjectList;
