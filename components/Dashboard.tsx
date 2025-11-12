'use client';

import { useState } from 'react';
import CreateProject from './ProjectCreation';
import ProjectList from './ProjectList';

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProjectCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
            Task Tracker
          </h1>
        
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:sticky lg:top-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Project</h2>
            <CreateProject onProjectCreated={handleProjectCreated} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Projects</h2>
            <ProjectList key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        