'use client';

import { useState } from 'react';
import supabase from '../lib/supabase';

interface TaskCreationProps {
  projectId: number;
  onTaskCreated: () => void;
}

const TaskCreation = ({ projectId, onTaskCreated }: TaskCreationProps) => {
  const [taskName, setTaskName] = useState('');
  const [taskStatus, setTaskStatus] = useState('todo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('tasks').insert([
        {
          taskname: taskName,
          status: taskStatus,
          project_id: projectId,
        },
      ]);

      if (error) throw error;

      setTaskName('');
      setTaskStatus('todo');
      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Enter task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400 text-sm"
        />
      </div>
      <div className="w-40">
        <select
          value={taskStatus}
          onChange={(e) => setTaskStatus(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 text-sm"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
      >
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
};

export default TaskCreation;
