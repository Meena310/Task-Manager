let editingIndex = null;
let notes = JSON.parse(localStorage.getItem("notes")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("itemList");
  const addBtn = document.getElementById("addBtn");
  const editor = document.getElementById("richEditor");
  const tagInput = document.getElementById("tagInput");
  const searchBar = document.querySelector(".search-bar");
  const themeToggle = document.querySelector(".theme-toggle");
  const modal = document.getElementById("noteModal");

  
  const extras = document.querySelector(".extras");
  const deadlineInput = document.createElement("input");
  deadlineInput.type = "date";
  deadlineInput.id = "deadlineInput";
  deadlineInput.className = "deadline-input";
  deadlineInput.placeholder = "Set deadline";
  extras.insertBefore(deadlineInput, addBtn);

  
  function renderNotes(filter = "") {
    list.innerHTML = "";
    const now = new Date();

    notes
      .filter(n => n.text.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => b.pinned - a.pinned)
      .forEach((note, index) => {
        const li = document.createElement("li");
        li.classList.add("note-item");

        
        const deadlineDisplay = note.deadline
          ? new Date(note.deadline) < now
            ? `<span class="deadline overdue">⚠️ ${note.deadline}</span>`
            : `<span class="deadline">📅 ${note.deadline}</span>`
          : "";

        li.innerHTML = `
          <div class="note-main">
            <div class="note-content">${note.text}</div>
            <div class="note-tag">${note.tag ? "#" + note.tag : ""}</div>
            <div class="note-time">${note.time}</div>
            ${deadlineDisplay}
          </div>
          <div class="note-actions">
            <button class="status-btn ${note.status.toLowerCase()}">${note.status}</button>
            <button class="edit-btn">✏️</button>
            <button class="delete-btn">🗑️</button>
            <button class="pin-btn">${note.pinned ? "📌" : "📍"}</button>
          </div>
        `;

        
        li.querySelector(".edit-btn").addEventListener("click", () => {
          editor.innerHTML = note.text;
          tagInput.value = note.tag || "";
          deadlineInput.value = note.deadline || "";
          editingIndex = index;
          modal.classList.add("active");
        });

        
        li.querySelector(".delete-btn").addEventListener("click", () => {
          notes.splice(index, 1);
          saveNotes();
          renderNotes(searchBar.value);
        });

        
        li.querySelector(".pin-btn").addEventListener("click", () => {
          notes[index].pinned = !notes[index].pinned;
          saveNotes();
          renderNotes(searchBar.value);
        });

        
        const statusBtn = li.querySelector(".status-btn");
        statusBtn.addEventListener("click", () => {
          const statuses = ["To Do", "In Progress", "Done"];
          let currentIndex = statuses.indexOf(note.status);
          let nextStatus = statuses[(currentIndex + 1) % statuses.length];
          note.status = nextStatus;
          saveNotes();
          renderNotes(searchBar.value);
        });

        
        li.style.animation = `popIn 0.4s ease`;
        list.appendChild(li);
      });
  }

  function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
  }

  addBtn.addEventListener("click", () => {
    const content = editor.innerHTML.trim();
    const tag = tagInput.value.trim();
    const deadline = deadlineInput.value;
    if (!content) return;

    const now = new Date();
    const timestamp = now.toLocaleString();

    const newNote = {
      text: content,
      tag,
      pinned: false,
      time: timestamp,
      status: "To Do",
      deadline
    };

    if (editingIndex !== null) {
      notes[editingIndex] = newNote;
      editingIndex = null;
    } else {
      notes.unshift(newNote);
    }

    saveNotes();
    renderNotes(searchBar.value);
    editor.innerHTML = "";
    tagInput.value = "";
    deadlineInput.value = "";
    modal.classList.remove("active");
  });

  
  searchBar.addEventListener("input", (e) => {
    renderNotes(e.target.value);
  });

  
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  });


  document.querySelectorAll(".editor-toolbar button").forEach(btn => {
    btn.addEventListener("click", () => {
      const cmd = btn.dataset.cmd;
      document.execCommand(cmd, false, null);
      editor.focus();
    });
  });


  renderNotes();
});
