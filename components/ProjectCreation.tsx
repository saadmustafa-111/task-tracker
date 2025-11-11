'use client';

import { useState } from 'react';
import supabase from '../lib/supabase';

interface ProjectCreationProps {
  onProjectCreated: () => void;
}

const CreateProject = ({ onProjectCreated }: ProjectCreationProps) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('projects').insert([
        { title, deadline, clientname: clientName }
      ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Project created successfully!' });
      setTitle('');
      setDeadline('');
      setClientName('');
      onProjectCreated();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
          <p className="text-blue-100 mt-1 text-sm">Fill in the details to start tracking your project</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
              Project Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700">
              Deadline
            </label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="clientName" className="block text-sm font-semibold text-gray-700">
              Client Name
            </label>
            <input
              id="clientName"
              type="text"
              placeholder="Enter client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400"
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? 'Creating Project...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;