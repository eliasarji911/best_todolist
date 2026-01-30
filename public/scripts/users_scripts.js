let allUsers = [];

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

async function apiFetch(url, options = {}) {
  options.credentials = "include";
  const res = await fetch(url, options);
  if (res.status === 401) {
    location.href = "/login";
    throw new Error("Not logged in");
  }
  return res;
}

async function loadUsers() {
  try {
    const res = await apiFetch("/users");
    if (!res.ok) {
      showMsg("❌ Failed to load users", false);
      return;
    }

    allUsers = await res.json();
    renderUsers();
  } catch (err) {
    console.log(err);
  }
}

function renderUsers() {
  const tbody = document.getElementById("usersTable");
  tbody.innerHTML = "";

  if (allUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:10px;">No users here.</td>
      </tr>
    `;
    return;
  }

  for (const u of allUsers) {
    const id = u.id;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align:center;">${id}</td>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(u.userName)}</td>
      <td style="text-align:center;">${u.created_at ? escapeHtml(String(u.created_at)) : ""}</td>
      <td style="text-align:center;">
        <button type="button" onclick="startUserEdit(${id}, '${escapeHtml(u.name).replaceAll("&#039;", "\\'")}', '${escapeHtml(u.email).replaceAll("&#039;", "\\'")}', '${escapeHtml(u.userName).replaceAll("&#039;", "\\'")}')">Edit</button>
      </td>
      <td style="text-align:center;">
        <button type="button" onclick="deleteUser(${id})">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  }
}

function startUserEdit(id, name, email, userName) {
  document.getElementById("userId").value = id;
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("userName").value = userName;

  document.getElementById("userCancelBtn").style.display = "inline-block";
}

function cancelUserEdit() {
  document.getElementById("userId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("userName").value = "";

  document.getElementById("userCancelBtn").style.display = "none";
}

async function updateUser() {
  const id = document.getElementById("userId").value;
  if (!id) {
    showMsg("❌ Choose a user with Edit first", false);
    return;
  }

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const userName = document.getElementById("userName").value.trim();

  if (!name && !email && !userName) {
    showMsg("❌ Fill at least one field", false);
    return;
  }

  try {
    const body = {};
    if (name) body.name = name;
    if (email) body.email = email;
    if (userName) body.userName = userName;

    const res = await apiFetch(`/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      showMsg(data.msg || "❌ Failed to update user", false);
      return;
    }

    showMsg(data.msg || "✅ User updated");
    cancelUserEdit();
    await loadUsers();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error", false);
  }
}

async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;

  try {
    const res = await apiFetch(`/users/${id}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      showMsg(data.msg || "❌ Failed to delete user", false);
      return;
    }

    showMsg(data.msg || "✅ User deleted");
    await loadUsers();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error", false);
  }
}

window.onload = loadUsers;
