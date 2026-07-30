import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import TodoList from './TodoList.jsx';
import TaskModal from './TaskModal.jsx';

// Firestore structure:
//   lists: { name, ownerId, createdAt }
//   tasks: { listId, ownerId, title, description, dueDate, priority, order, createdAt }
export default function Dashboard({ user }) {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newListName, setNewListName] = useState('');
  // modal = null | { listId } (add) | { listId, task } (edit)
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'lists'), where('ownerId', '==', user.uid));
    return onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setLists(arr);
    });
  }, [user.uid]);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), where('ownerId', '==', user.uid));
    return onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user.uid]);

  const createList = async (e) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    setNewListName('');
    await addDoc(collection(db, 'lists'), {
      name,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const deleteList = async (listId) => {
    if (!confirm('Delete this list and all its tasks?')) return;
    const batch = writeBatch(db);
    tasks.filter((t) => t.listId === listId).forEach((t) => batch.delete(doc(db, 'tasks', t.id)));
    batch.delete(doc(db, 'lists', listId));
    await batch.commit();
  };

  // Save from modal: add new task or update existing
  const saveTask = async (data) => {
    if (modal.task) {
      await updateDoc(doc(db, 'tasks', modal.task.id), data);
    } else {
      const order = tasks.filter(
        (t) => t.listId === modal.listId && t.priority === data.priority
      ).length;
      await addDoc(collection(db, 'tasks'), {
        ...data,
        listId: modal.listId,
        ownerId: user.uid,
        order,
        createdAt: serverTimestamp(),
      });
    }
    setModal(null);
  };

  const deleteTask = (taskId) => deleteDoc(doc(db, 'tasks', taskId));

  // Drag n Drop: drop a task into a priority section of any list.
  // Sets its listId + priority and position; reindexes source & target groups.
  const moveTask = async (taskId, targetListId, targetPriority, targetIndex) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const sortByOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
    const group = (listId, priority, excludeId) =>
      tasks
        .filter((t) => t.listId === listId && (t.priority || 'Medium') === priority && t.id !== excludeId)
        .sort(sortByOrder);

    const target = group(targetListId, targetPriority, taskId);
    target.splice(Math.min(targetIndex, target.length), 0, task);

    const batch = writeBatch(db);
    target.forEach((t, i) =>
      batch.update(doc(db, 'tasks', t.id), {
        order: i,
        listId: targetListId,
        priority: targetPriority,
      })
    );
    // reindex the group the task came from (if different)
    const fromPriority = task.priority || 'Medium';
    if (task.listId !== targetListId || fromPriority !== targetPriority) {
      group(task.listId, fromPriority, taskId).forEach((t, i) =>
        batch.update(doc(db, 'tasks', t.id), { order: i })
      );
    }
    await batch.commit();
  };

  return (
    <div className="dashboard">
      <header className="top-card">
        <div>
          <h1>My Todo Lists</h1>
          <p className="tagline">Organize your daily work efficiently</p>
        </div>
        <div className="user-info">
          <span className="user-chip">
            <span className="user-icon">&#128100;</span>
            {user.displayName || user.email}
          </span>
          <button className="logout-btn" onClick={() => signOut(auth)}>
            &#8618; Logout
          </button>
        </div>
      </header>

      <form className="new-list-form" onSubmit={createList}>
        <input
          type="text"
          placeholder="Enter List Name..."
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
        <button type="submit">Create List</button>
      </form>

      {lists.length === 0 && (
        <p className="empty">No lists yet. Create your first To Do List above.</p>
      )}

      <div className="lists">
        {lists.map((list) => (
          <TodoList
            key={list.id}
            list={list}
            tasks={tasks.filter((t) => t.listId === list.id)}
            onOpenAdd={() => setModal({ listId: list.id })}
            onOpenEdit={(task) => setModal({ listId: list.id, task })}
            onDeleteTask={deleteTask}
            onDeleteList={deleteList}
            onMoveTask={moveTask}
          />
        ))}
      </div>

      {modal && (
        <TaskModal
          task={modal.task}
          onSave={saveTask}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
