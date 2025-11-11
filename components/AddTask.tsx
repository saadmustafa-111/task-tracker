// Task creation component (e.g., CreateTask.tsx)
import { useState } from 'react';
import supabase from '../lib/supabase';  // Import your Supabase client

const CreateTask = ({ projectId }: { projectId: number }) => {
  const [taskName, setTaskName] = useState('');
  const [taskStatus, setTaskStatus] = useState('todo'); // Default status is 'todo'
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          name: taskName,          
          status: taskStatus,      
          project_id: projectId, 
        },
      ]);

    if (error) {
      console.error('Error creating task:', error);
    } else {
      console.log('Task created:', data);
      setTaskName('');  // Reset task name
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task Name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        required
      />
      <select
        value={taskStatus}
        onChange={(e) => setTaskStatus(e.target.value)}
        required
      >
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <button type="submit">Create Task</button>
    </form>
  );
};

export default CreateTask;
