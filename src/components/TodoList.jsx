import { useState, useEffect, useRef } from 'react';
import TaskCard from './TaskCard.jsx';

const PRIORITIES = [
  { name: 'High',   className: 'high'   },
  { name: 'Medium', className: 'medium' },
  { name: 'Low',    className: 'low'    },
];

// Auto-scroll speed and edge threshold (px from top/bottom)
const SCROLL_SPEED  = 10;
const SCROLL_ZONE   = 80;

export default function TodoList({
  list, tasks, onOpenAdd, onOpenEdit,
  onDeleteTask, onDeleteList, onMoveTask,
}) {
  const [dragOver, setDragOver] = useState(null);
  const rafRef     = useRef(null);
  const dragging   = useRef(false);

  // ── Auto-scroll on drag ──────────────────────────────
  useEffect(() => {
    const onDragOver = (e) => {
      if (!dragging.current) return;
      const y = e.clientY;
      const h = window.innerHeight;

      cancelAnimationFrame(rafRef.current);

      const scroll = () => {
        if (!dragging.current) return;
        if (y < SCROLL_ZONE) {
          window.scrollBy(0, -SCROLL_SPEED);
        } else if (y > h - SCROLL_ZONE) {
          window.scrollBy(0, SCROLL_SPEED);
        }
        rafRef.current = requestAnimationFrame(scroll);
      };

      if (y < SCROLL_ZONE || y > h - SCROLL_ZONE) {
        rafRef.current = requestAnimationFrame(scroll);
      }
    };

    const onDragStart = () => { dragging.current = true; };
    const onDragEnd   = () => {
      dragging.current = false;
      cancelAnimationFrame(rafRef.current);
    };

    window.addEventListener('dragover',  onDragOver);
    window.addEventListener('dragstart', onDragStart);
    window.addEventListener('dragend',   onDragEnd);

    return () => {
      window.removeEventListener('dragover',  onDragOver);
      window.removeEventListener('dragstart', onDragStart);
      window.removeEventListener('dragend',   onDragEnd);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
  // ────────────────────────────────────────────────────

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
          <span className="list-badge">{list.name.charAt(0).toUpperCase()}</span> {list.name}
        </h3>
        <div className="list-actions">
          <button className="add-btn" onClick={onOpenAdd}>+ Add</button>
          <button className="icon-btn" title="Delete list" onClick={() => onDeleteList(list.id)}>
            &#10005;
          </button>
        </div>
      </div>

      <p className="total-tasks">
        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} in this list
      </p>

      {PRIORITIES.map(({ name, className }) => {
        const secTasks = sectionTasks(name);
        return (
          <div className="priority-section" key={name}>
            <div className={`priority-head head-${className}`}>
              <span className={`dot dot-${className}`} />
              <span className="priority-label">{name}</span>
              <span className="count-chip">{secTasks.length}</span>
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
