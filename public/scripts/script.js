let allTasks = []; // cache

function showMsg(text, ok = true) {
  const p = document.getElementById("msg");
  if (!p) return;
  p.textContent = text;
  p.style.color = ok ? "green" : "red";
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ✅ GET tasks from server
async function loadTasks() {
  try {
    const res = await fetch("/tasks", {
      method: "GET",
      credentials: "include", // ✅ IMPORTANT for cookies login
    });

    if (!res.ok) {
      showMsg("❌ Failed to load tasks (maybe not logged in)", false);
      return;
    }

    allTasks = await res.json();
    renderTasks();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error loading tasks", false);
  }
}

// ✅ Render tasks table with filter
function renderTasks() {
  const tbody = document.getElementById("myTable");
  const filter = document.getElementById("mySelect").value;

  tbody.innerHTML = "";

  let tasksToShow = allTasks;

  if (filter === "done") {
    tasksToShow = allTasks.filter((t) => t.is_done == 1);
  } else if (filter === "todo") {
    tasksToShow = allTasks.filter((t) => t.is_done == 0);
  }

  if (tasksToShow.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:10px;">
          No tasks here.
        </td>
      </tr>
    `;
    return;
  }

  for (const t of tasksToShow) {
    // ⚠️ Your DB id name might be "id" OR "task_id"
    const id = t.task_id ?? t.id;

    const tr = document.createElement("tr");

    const doneChecked = t.is_done == 1 ? "checked" : "";
    const textStyle = t.is_done == 1 ? "text-decoration: line-through; opacity:0.6;" : "";

    tr.innerHTML = `
      <td style="text-align:center;">
        <input type="checkbox" ${doneChecked} onchange="setDone(${id}, this.checked)" />
      </td>

      <td style="${textStyle}">
        ${escapeHtml(t.text)}
      </td>

      <td style="text-align:center;">
        <button type="button" onclick="startEdit(${id}, '${escapeHtml(t.text).replaceAll("&#039;", "\\'")}')">Edit</button>
      </td>

      <td style="text-align:center;">
        <button type="button" onclick="deleteTask(${id})">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  }
}

// ✅ Add OR Edit task
async function addOrEdit() {
  const idInput = document.getElementById("id");
  const textInput = document.getElementById("text");

  const id = idInput.value;
  const text = textInput.value.trim();

  if (!text) {
    showMsg("❌ Enter task text", false);
    return;
  }

  try {
    // ✅ EDIT
    if (id) {
      const res = await fetch(`/tasks/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        showMsg("❌ Failed to update task", false);
        return;
      }

      showMsg("✅ Task updated");
      cancelEdit();
      await loadTasks();
      return;
    }

    // ✅ ADD
    const res = await fetch("/tasks", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      showMsg("❌ Failed to add task", false);
      return;
    }

    showMsg("✅ Task added");
    textInput.value = "";
    await loadTasks();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error", false);
  }
}

// ✅ Delete task
async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;

  try {
    const res = await fetch(`/tasks/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      showMsg("❌ Failed to delete task", false);
      return;
    }

    showMsg("✅ Task deleted");
    await loadTasks();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error deleting task", false);
  }
}

// ✅ Done / Not Done
async function setDone(id, checked) {
  try {
    const res = await fetch(`/tasks/${id}/done`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: checked ? 1 : 0 }),
    });

    if (!res.ok) {
      showMsg("❌ Failed to update done status", false);
      return;
    }

    await loadTasks();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error updating done", false);
  }
}

// ✅ Start Edit mode
function startEdit(id, text) {
  document.getElementById("id").value = id;
  document.getElementById("text").value = text;

  document.getElementById("sendBtn").textContent = "Update";
  document.getElementById("cancelBtn").style.display = "inline-block";
}

// ✅ Cancel edit mode
function cancelEdit() {
  document.getElementById("id").value = "";
  document.getElementById("text").value = "";

  document.getElementById("sendBtn").textContent = "Send";
  document.getElementById("cancelBtn").style.display = "none";
}

window.onload = loadTasks;

