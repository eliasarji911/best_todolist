let allCategories = [];

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
    // ✅ Teacher requirement: if not logged in -> go to login
    location.href = "/login";
    throw new Error("Not logged in");
  }
  return res;
}

async function loadCategories() {
  try {
    const res = await apiFetch("/categories");
    if (!res.ok) {
      showMsg("❌ Failed to load categories", false);
      return;
    }
    allCategories = await res.json();
    renderCategories();
  } catch (err) {
    console.log(err);
  }
}

function renderCategories() {
  const tbody = document.getElementById("catTable");
  tbody.innerHTML = "";

  if (allCategories.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:10px;">No categories here.</td>
      </tr>
    `;
    return;
  }

  for (const c of allCategories) {
    const id = c.id;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align:center;">${id}</td>
      <td>${escapeHtml(c.name)}</td>
      <td style="text-align:center;">
        <button type="button" onclick="startCategoryEdit(${id}, '${escapeHtml(c.name).replaceAll("&#039;", "\\'")}')">Edit</button>
      </td>
      <td style="text-align:center;">
        <button type="button" onclick="deleteCategory(${id})">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  }
}

async function addOrUpdateCategory() {
  const idInput = document.getElementById("catId");
  const nameInput = document.getElementById("catName");

  const id = idInput.value;
  const name = nameInput.value.trim();

  if (!name) {
    showMsg("❌ Enter category name", false);
    return;
  }

  try {
    // ✅ UPDATE
    if (id) {
      const res = await apiFetch(`/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        showMsg("❌ Failed to update category", false);
        return;
      }

      showMsg("✅ Category updated");
      cancelCategoryEdit();
      await loadCategories();
      return;
    }

    // ✅ ADD
    const res = await apiFetch("/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      showMsg("❌ Failed to add category", false);
      return;
    }

    showMsg("✅ Category added");
    nameInput.value = "";
    await loadCategories();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error", false);
  }
}

async function deleteCategory(id) {
  // ✅ Teacher requirement: warn user that tasks will be deleted too
  const ok = confirm(
    "Deleting this category will also delete ALL tasks inside it. Continue?"
  );
  if (!ok) return;

  try {
    const res = await apiFetch(`/categories/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      showMsg("❌ Failed to delete category", false);
      return;
    }

    showMsg("✅ Category deleted (and its tasks)");
    await loadCategories();
  } catch (err) {
    console.log(err);
    showMsg("❌ Server error deleting category", false);
  }
}

function startCategoryEdit(id, name) {
  document.getElementById("catId").value = id;
  document.getElementById("catName").value = name;

  document.getElementById("catSendBtn").textContent = "Update";
  document.getElementById("catCancelBtn").style.display = "inline-block";
}

function cancelCategoryEdit() {
  document.getElementById("catId").value = "";
  document.getElementById("catName").value = "";

  document.getElementById("catSendBtn").textContent = "Send";
  document.getElementById("catCancelBtn").style.display = "none";
}

window.onload = loadCategories;
