import { useEffect, useState } from "react";
import {
  getRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  markAsReturned,
  getUsers,
  getBooks,
  type Record, // import the Record interface from your api.ts
  type User,
  type Book,
} from "../service/api";
import "./record.css";

const badgeClassForState = (state: string) => {
  switch (state) {
    case "BORROWED":
      return "badge badge-borrowed";
    case "RETURNED":
      return "badge badge-returned";
    case "UPDATED":
      return "badge badge-updated";
    default:
      return "badge badge-default";
  }
};

const todayISO = () => new Date().toISOString().slice(0, 10);

type RecordFormData = {
  userId: string;
  bookId: string;
  borrowedDate: string;
  state: string;
};

const emptyForm: RecordFormData = {
  userId: "",
  bookId: "",
  borrowedDate: todayISO(),
  state: "BORROWED",
};

export default function RecordSection(): any {
  const [records, setRecords] = useState<Record[]>([]);
  const [search, setSearch] = useState<string>("");

  // Data needed for the user/book dropdowns
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Add/Edit form state
  const [formMode, setFormMode] = useState<"none" | "add" | "edit">("none");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RecordFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Track which row's "Mark Returned" button is mid-request
  const [returningId, setReturningId] = useState<string | null>(null);

  useEffect(() => {
    refreshRecords();
  }, []);

  const refreshRecords = () => {
    getRecords().then((res) => setRecords(res.data));
  };

  const refreshOptions = () => {
    setLoadingOptions(true);
    Promise.all([getUsers(), getBooks()])
      .then(([usersRes, booksRes]) => {
        setUsers(usersRes.data);
        setBooks(booksRes.data);
      })
      .catch((err) => {
        console.error("Failed to load users/books:", err?.response?.data ?? err);
        alert("Could not load users and books for the form. Check the console.");
      })
      .finally(() => setLoadingOptions(false));
  };

  const handleOpenAdd = () => {
    setFormMode("add");
    setEditingId(null);
    setFormData(emptyForm);
    refreshOptions();
  };

  const handleOpenEdit = (r: Record) => {
    setFormMode("edit");
    setEditingId(r.id);
    setFormData({
      userId: r.userId,
      bookId: r.bookId,
      borrowedDate: r.borrowedDate
        ? new Date(r.borrowedDate).toISOString().slice(0, 10)
        : todayISO(),
      state: r.state,
    });
    refreshOptions();
  };

  const handleCancelForm = () => {
    setFormMode("none");
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleFieldChange = (field: keyof RecordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = () => {
    if (!formData.userId || !formData.bookId) {
      alert("Please select both a user and a book.");
      return;
    }

    setSubmitting(true);

    if (formMode === "add") {
      const newRecord: Omit<Record, "id" | "returnedDate"> = {
        userId: formData.userId,
        bookId: formData.bookId,
        borrowedDate: new Date(formData.borrowedDate),
        state: "BORROWED",
      };
      addRecord(newRecord as Record)
        .then(() => {
          refreshRecords();
          handleCancelForm();
        })
        .catch((err) => {
          console.error("Add record failed:", err?.response?.data ?? err);
          alert(
            "Failed to add record: " +
              (err?.response?.data?.message ?? err?.message ?? "Unknown error")
          );
        })
        .finally(() => setSubmitting(false));
    } else if (formMode === "edit" && editingId) {
      const current = records.find((r) => r.id === editingId);
      updateRecord(editingId, {
        ...current,
        userId: formData.userId,
        bookId: formData.bookId,
        borrowedDate: new Date(formData.borrowedDate),
        state: formData.state,
      } as Record)
        .then(() => {
          refreshRecords();
          handleCancelForm();
        })
        .catch((err) => {
          console.error("Update record failed:", err?.response?.data ?? err);
          alert(
            "Failed to update record: " +
              (err?.response?.data?.message ?? err?.message ?? "Unknown error")
          );
        })
        .finally(() => setSubmitting(false));
    } else {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) =>
    deleteRecord(id)
      .then(refreshRecords)
      .catch((err) => console.error("Delete record failed:", err?.response?.data ?? err));

  const handleReturn = (r: Record) => {
    if (r.state === "RETURNED") return;
    const confirmed = window.confirm(
      `Mark this record (user: ${r.userId}, book: ${r.bookId}) as returned?`
    );
    if (!confirmed) return;

    setReturningId(r.id);
    markAsReturned(r.id)
      .then(refreshRecords)
      .catch((err) => {
        console.error("Mark returned failed:", err?.response?.data ?? err);
        alert(
          "Failed to mark as returned: " +
            (err?.response?.data?.message ?? err?.message ?? "Unknown error")
        );
      })
      .finally(() => setReturningId(null));
  };

  const userLabel = (id: string) => {
    const match = users.find((u) => u.id === id);
    return match ? `${match.name} (${match.email})` : id;
  };

  const bookLabel = (id: string) => {
    const match = books.find((b) => b.id === id);
    return match ? `${match.name} — ${match.author}` : id;
  };

  const filtered = records.filter((r) =>
    r.userId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Circulation</div>
          <h2 className="page-title">Borrowed Records</h2>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search records by user ID..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Book ID</th>
              <th>Borrowed</th>
              <th>Returned</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="cell-mono">{r.userId}</td>
                <td className="cell-mono">{r.bookId}</td>
                <td>
                  {r.borrowedDate
                    ? new Date(r.borrowedDate).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {r.returnedDate
                    ? new Date(r.returnedDate).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  <span className={badgeClassForState(r.state)}>{r.state}</span>
                </td>
                <td>
                  <div className="cell-actions">
                    <button onClick={() => handleOpenEdit(r)} className="btn btn-update">
                      Update
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="btn btn-delete">
                      Delete
                    </button>
                    <button
                      onClick={() => handleReturn(r)}
                      className="btn btn-return"
                      disabled={r.state === "RETURNED" || returningId === r.id}
                    >
                      {returningId === r.id
                        ? "Returning..."
                        : r.state === "RETURNED"
                        ? "Returned"
                        : "Mark Returned"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "28px", color: "var(--color-slate-light)" }}>
                  No records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formMode === "none" && (
        <button onClick={handleOpenAdd} className="btn btn-primary">
          Add Record
        </button>
      )}

      {formMode !== "none" && (
        <div className="inline-form">
          <div className="inline-form-title">
            {formMode === "add" ? "New Borrow Record" : "Edit Record"}
          </div>

          {loadingOptions ? (
            <p style={{ color: "var(--color-slate)" }}>Loading users and books...</p>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="record-user">
                    User
                  </label>
                  <select
                    id="record-user"
                    className="form-select"
                    value={formData.userId}
                    onChange={(e) => handleFieldChange("userId", e.target.value)}
                  >
                    <option value="">Select a user...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                    {formMode === "edit" &&
                      formData.userId &&
                      !users.some((u) => u.id === formData.userId) && (
                        <option value={formData.userId}>{userLabel(formData.userId)}</option>
                      )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="record-book">
                    Book
                  </label>
                  <select
                    id="record-book"
                    className="form-select"
                    value={formData.bookId}
                    onChange={(e) => handleFieldChange("bookId", e.target.value)}
                  >
                    <option value="">Select a book...</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.author}
                      </option>
                    ))}
                    {formMode === "edit" &&
                      formData.bookId &&
                      !books.some((b) => b.id === formData.bookId) && (
                        <option value={formData.bookId}>{bookLabel(formData.bookId)}</option>
                      )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="record-date">
                    Borrowed Date
                  </label>
                  <input
                    id="record-date"
                    type="date"
                    className="form-input"
                    value={formData.borrowedDate}
                    onChange={(e) => handleFieldChange("borrowedDate", e.target.value)}
                  />
                </div>

                {formMode === "edit" && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="record-state">
                      State
                    </label>
                    <select
                      id="record-state"
                      className="form-select"
                      value={formData.state}
                      onChange={(e) => handleFieldChange("state", e.target.value)}
                    >
                      <option value="BORROWED">Borrowed</option>
                      <option value="RETURNED">Returned</option>
                      <option value="UPDATED">Updated</option>
                    </select>
                  </div>
                )}
              </div>

              {users.length === 0 && (
                <div className="form-hint">No users found — add a user first.</div>
              )}
              {books.length === 0 && (
                <div className="form-hint">No books found — add a book first.</div>
              )}

              <div className="form-actions">
                <button
                  onClick={handleSubmitForm}
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ marginTop: 0 }}
                >
                  {submitting
                    ? "Saving..."
                    : formMode === "add"
                    ? "Save Record"
                    : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelForm}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}