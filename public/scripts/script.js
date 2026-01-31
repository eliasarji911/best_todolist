let allTasks = [];
let allCategories = [];

function showMsg(text, ok = true) {
  const p = document.getElementById("msg");
  if (!p) return;
  p.textContent = text;
  p.style.color = ok ? "green" : "red";
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function apiFetch(url, options = {}) {
  options.credentials = "include";
  const res = await fetch(url, options);
  if (res.status === 401) {
    location.href = "/login";
    throw new Error("Not logged in");
  }
  return res;
}

async function loadHello() {
  try {
    const res = await apiFetch("/auth/me");
    if (!res.ok) return;

    const data = await res.json().catch(() => ({}));
    const el = document.getElementById("helloName");
    if (!el) return;

    const name = (data.name || data.userName || "").trim();
    el.textContent = name ? `Hi ${name} 👋` : "";
  } catch (err) {
    console.log(err);
  }
}


function fillCategorySelect(selectedId = "") {
  const sel = document.getElementById("categorySelect");
  if (!sel) return;

  sel.innerHTML = "";

  const optNone = document.createElement("option");
  optNone.value = "";
  optNone.textContent = "No Category";
  sel.appendChild(optNone);

  for (const c of allCategories) {
    const opt = document.createElement("option");
    opt.value = String(c.id);
    opt.textContent = c.name;
    sel.appendChild(opt);
  }

  sel.value = selectedId ? String(selectedId) : "";
}

function getCategoryNameById(catId) {
  if (!catId) return "";
  const found = allCategories.find((c) => String(c.id) === String(catId));
  return found ? found.name : "";
}

async function loadCategories() {
  try {
    const res = await apiFetch("/categories");
    if (!res.ok) {
      showMsg("❌ Failed to load categories", false);
      return;
    }
    allCategories = await res.json();
    fillCategorySelect();
  } catch (err) {
    console.log(err);
  }
}


async function loadTasks() {
  try {
    const res = await apiFetch("/tasks");
    if (!res.ok) {
      showMsg("❌ Failed to load tasks", false);
      return;
    }
    allTasks = await res.json();
    renderTasks();
  } catch (err) {
    console.log(err);
  }
}

function renderTasks() {
  const tbody = document.getElementById("myTable");
  const filter = document.getElementById("mySelect").value;

  tbody.innerHTML = "";

  let tasksToShow = allTasks;

  if (filter === "done") tasksToShow = allTasks.filter((t) => t.is_done == 1);
  if (filter === "todo") tasksToShow = allTasks.filter((t) => t.is_done == 0);

  if (tasksToShow.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:10px;">
          No tasks here.
        </td>
      </tr>
    `;
    return;
  }

  for (const t of tasksToShow) {
    const id = t.task_id ?? t.id;
    const catId = t.category_id ?? "";

    const tr = document.createElement("tr");

    const doneChecked = t.is_done == 1 ? "checked" : "";
    const textStyle = t.is_done == 1 ? "text-decoration: line-through; opacity:0.6;" : "";

    const catName = t.category_name ?? getCategoryNameById(catId) ?? "";

   
    const safeText = escapeHtml(t.text).replaceAll("&#039;", "\\'");

    tr.innerHTML = `
      <td style="text-align:center;">
        <input type="checkbox" ${doneChecked} onchange="setDone(${id}, this.checked)" />
      </td>

      <td>${escapeHtml(catName)}</td>

      <td style="${textStyle}">
        ${escapeHtml(t.text)}
      </td>

      <td style="text-align:center;">
        <button type="button" onclick="startEdit(${id}, '${catId}', '${safeText}')">Edit</button>
      </td>

      <td style="text-align:center;">
        <button type="button" onclick="deleteTask(${id})">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  }
}

async function addOrEdit() {
  const idInput = document.getElementById("id");
  const textInput = document.getElementById("text");
  const catSelect = document.getElementById("categorySelect");

  const id = idInput.value;
  const text = textInput.value.trim();
  const category_id = catSelect ? catSelect.value : "";

  if (!text) {
    showMsg("❌ Enter task text", false);
    return;
  }

  const body = {
    text,
    category_id: category_id === "" ? null : Number(category_id),
  };

  try {
   
    if (id) {
      const res = await apiFetch(`/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMsg(data.msg || "❌ Failed to update task", false);
        return;
      }

      showMsg("✅ Task updated");
      cancelEdit();
      await loadTasks();
      return;
    }

   
    const res = await apiFetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showMsg(data.msg || "❌ Failed to add task", false);
      return;
    }

    showMsg("✅ Task added");
    textInput.value = "";
    fillCategorySelect();
    await loadTasks();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error", false);
  }
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;

  try {
    const res = await apiFetch(`/tasks/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      showMsg(data.msg || "❌ Failed to delete task", false);
      return;
    }

    showMsg("✅ Task deleted");
    await loadTasks();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error deleting task", false);
  }
}

async function setDone(id, checked) {
  try {
    const res = await apiFetch(`/tasks/${id}/done`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: checked ? 1 : 0 }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showMsg(data.msg || "❌ Failed to update done status", false);
      return;
    }

    await loadTasks();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error updating done", false);
  }
}

function startEdit(id, catId, text) {
  document.getElementById("id").value = id;
  document.getElementById("text").value = text;

  fillCategorySelect(catId);

  document.getElementById("sendBtn").textContent = "Update";
  document.getElementById("cancelBtn").style.display = "inline-block";
}

function cancelEdit() {
  document.getElementById("id").value = "";
  document.getElementById("text").value = "";

  fillCategorySelect();

  document.getElementById("sendBtn").textContent = "Send";
  document.getElementById("cancelBtn").style.display = "none";
}

window.onload = async () => {
  await loadHello();
  await loadCategories();
  await loadTasks();
};




