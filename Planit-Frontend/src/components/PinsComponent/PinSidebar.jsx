import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import settingsIcon from "../../assets/settings.svg";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "../../lib/firebase";

const PinSidebar = ({ pinData, onClose }) => {
  const [title, setTitle] = useState(pinData.title || "");
  const [color, setColor] = useState(pinData.color || "#ff0000");
  const [visited, setVisited] = useState(pinData.visited || false);
  const [date, setDate] = useState(pinData.date || "");
  const [notes, setNotes] = useState(pinData.notes || []);
  const [todoList, setTodoList] = useState(pinData.todoList || []);
  const [isPrivate, setIsPrivate] = useState(pinData.private || false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const pinRef = pinData.id ? doc(firestore, "pins", pinData.id) : null;

  useEffect(() => {
    setIsDirty(true);
  }, [title, color, visited, date, notes, todoList, isPrivate]);

  const handleSave = async () => {
    if (!isDirty || !pinRef) return;
    setIsSaving(true);
    try {
      await updateDoc(pinRef, {
        title,
        color,
        visited,
        date,
        notes,
        todoList,
        private: isPrivate,
      });
      setIsDirty(false);
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pinRef) return;
    await deleteDoc(pinRef);
    setConfirmDelete(false);
    onClose();
  };

  const handleClearData = async () => {
    const defaults = {
      title: "",
      color: "#ff0000",
      visited: false,
      date: "",
      notes: "",
      todoList: [],
      private: false,
    };
    setTitle(defaults.title);
    setColor(defaults.color);
    setVisited(defaults.visited);
    setDate(defaults.date);
    setNotes(defaults.notes);
    setTodoList(defaults.todoList);
    setIsPrivate(defaults.private);
    if (pinRef) await updateDoc(pinRef, defaults);
    setIsDirty(false);
    setConfirmClear(false);
  };

  const handleColorChange = async (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    if (pinRef) {
      await updateDoc(pinRef, { color: newColor });
    }
  };

  return (
    <div className={`pin-sidebar ${showSettings ? "lock-scroll" : ""}`}>
      <div className="sidebar-header">
        <IoMdClose className="close-btn" onClick={onClose} />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
          placeholder="Pin Title"
          spellCheck={false}
          autoCorrect="off"
        />
        <img
          src={settingsIcon}
          alt="Settings"
          className="sidebar-settings-icon"
          onClick={() => setShowSettings((s) => !s)}
        />
      </div>

      {showSettings ? (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>Customization</h3>
          </div>

          <div className="settings-item">
            <label>Pin Color:</label>
            <input type="color" value={color} onChange={handleColorChange} />
          </div>

          <div className="settings-header">
            <h3>Travel Settings</h3>
          </div>

          <div className="settings-item">
            <label>Add to Roadtrip:</label>
            <input type="checkbox" disabled />
          </div>

          <div className="settings-header">
            <h3>Actions</h3>
          </div>

          <div className="settings-item">
            <label>Private Pin:</label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
          </div>

          <div className="settings-item">
            {confirmClear ? (
              <div>
                <p>Confirm clear all pin data?</p>
                <button onClick={handleClearData}>Yes, Clear</button>
                <button onClick={() => setConfirmClear(false)}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmClear(true)}>Clear Data</button>
            )}
          </div>

          <div className="settings-item">
            {confirmDelete ? (
              <div className="bottom-border">
                <p>Are you sure you want to delete this pin?</p>
                <button onClick={handleDelete}>Yes, Delete</button>
                <button onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}>Delete Pin</button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="sidebar-section planning">
            <h3>Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              autoCorrect="on"
            />
          </div>

          <div className="sidebar-section planning">
            <h3>To-Do List</h3>
            {todoList.map((item, i) => (
              <div key={i} className="todo-item">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => {
                    const updated = [...todoList];
                    updated[i].done = !updated[i].done;
                    setTodoList(updated);
                  }}
                />
                <input
                  type="text"
                  value={item.task}
                  onChange={(e) => {
                    const updated = [...todoList];
                    updated[i].task = e.target.value;
                    setTodoList(updated);
                  }}
                  className="todo-input"
                />
              </div>
            ))}
            <button
              className="add-task-btn"
              onClick={() =>
                setTodoList([...todoList, { task: "", done: false }])
              }
            >
              + Add Task
            </button>
          </div>

          <div className="sidebar-section media">
            <h3>Photos</h3>
            <div className="photo-placeholder">+ Add Photo</div>
          </div>

          <div className="sidebar-section sharing">
            <h3>Friends</h3>
            <button className="collab-btn">Share pin with friends!</button>
          </div>

          <div className="sidebar-save">
            <button
              className="save-button"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            {showSavedMessage && (
              <div className="saved-toast">Changes saved!</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PinSidebar;