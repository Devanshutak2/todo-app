export default function TaskCard({ task, onEdit, onDelete }) {
  const overdue =
    task.dueDate && new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
    >
      <strong className="task-title">{task.title}</strong>
      {task.description && <p className="task-desc">{task.description}</p>}
      {task.dueDate && (
        <p className={`due ${overdue ? 'overdue' : ''}`}>{task.dueDate}</p>
      )}
      <div className="task-actions">
        <button className="sq-btn" title="Edit task" onClick={() => onEdit(task)}>
          &#9998;
        </button>
        <button className="sq-btn" title="Delete task" onClick={() => onDelete(task.id)}>
          &#128465;
        </button>
      </div>
    </div>
  );
}
