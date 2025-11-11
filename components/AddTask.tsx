
import { useState } from 'react';
import supabase from '../lib/supabase';

const CreateTask = ({ projectId }: { projectId: number }) => {
  const [taskName, setTaskName] = useState('');
  const [taskStatus, setTaskStatus] = useState('todo');
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
    } else {
      setTaskName('');
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
