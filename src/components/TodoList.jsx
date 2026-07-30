import { useState } from 'react';
import TaskCard from './TaskCard.jsx';

const PRIORITIES = [
  { name: 'High', className: 'high' },
  { name: 'Medium', className: 'medium' },
  { name: 'Low', className: 'low' },
];

// A To Do List card with three priority sections (High / Medium / Low).
// Drag a task into any section of any list to move it there and set its priority.
export default function TodoList({
  list,
  tasks,
  onOpenAdd,
  onOpenEdit,
  onDeleteTask,
  onDeleteList,
  onMoveTask,
}) {
  const [dragOver, setDragOver] = useState(null); // "Priority-index" | "Priority-zone"

  const sectionTasks = (priority) =>
    tasks
      .filter((t) => (t.priority || 'Medium') === priority)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleDrop = (e, priority, index) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onMoveTask(taskId, list.id, priority, index);
    setDragOver(null);
  };

  const allow = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(key);
  };

  return (
    <div className="todo-list">
      <div className="list-header">
        <h3>
          <span className="folder-icon">&#128193;</span> {list.name}
        </h3>
        <div className="list-actions">
          <button className="add-btn" onClick={onOpenAdd}>+ Add</button>
          <button className="icon-btn" title="Delete list" onClick={() => onDeleteList(list.id)}>
            &#10005;
          </button>
        </div>
      </div>

      <p className="total-tasks">Total Tasks : {tasks.length}</p>

      {PRIORITIES.map(({ name, className }) => {
        const secTasks = sectionTasks(name);
        return (
          <div className="priority-section" key={name}>
            <div className={`priority-banner banner-${className}`}>
              <span className={`dot dot-${className}`} /> {name} Priority
            </div>

            <div className="section-tasks">
              {secTasks.map((task, i) => (
                <div
                  key={task.id}
                  onDragOver={(e) => allow(e, `${name}-${i}`)}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => handleDrop(e, name, i)}
                  className={dragOver === `${name}-${i}` ? 'drop-target' : ''}
                >
                  <TaskCard task={task} onEdit={onOpenEdit} onDelete={onDeleteTask} />
                </div>
              ))}

              <div
                className={`dropzone ${secTasks.length ? 'dropzone-slim' : ''} ${
                  dragOver === `${name}-zone` ? 'dropzone-active' : ''
                }`}
                onDragOver={(e) => allow(e, `${name}-zone`)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, name, secTasks.length)}
              >
                {secTasks.length === 0 && 'Drop Here'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
