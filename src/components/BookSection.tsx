import { useEffect, useState } from "react";
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  updateStock,
  type Book,
} from "../service/api";
import "./library.css";

const badgeClassForState = (state: string) => {
  switch (state) {
    case "AVAILABLE":
      return "badge badge-available";
    case "BORROWED":
      return "badge badge-borrowed";
    case "UPDATED":
      return "badge badge-updated";
    default:
      return "badge badge-default";
  }
};

type BookFormData = {
  name: string;
  author: string;
  stock: number;
  state: string;
};

const emptyForm: BookFormData = {
  name: "",
  author: "",
  stock: 0,
  state: "AVAILABLE",
};

export default function BookSection() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState<string>("");

  // Add/Edit form state
  const [formMode, setFormMode] = useState<"none" | "add" | "edit">("none");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshBooks();
  }, []);

  const refreshBooks = () => {
    getBooks().then((res) => setBooks(res.data));
  };

  const handleOpenAdd = () => {
    setFormMode("add");
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleOpenEdit = (b: Book) => {
    setFormMode("edit");
    setEditingId(b.id);
    setFormData({
      name: b.name,
      author: b.author,
      stock: b.stock,
      state: b.state,
    });
  };

  const handleCancelForm = () => {
    setFormMode("none");
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleFieldChange = (field: keyof BookFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = () => {
    if (!formData.name.trim() || !formData.author.trim()) {
      alert("Please enter both a name and an author.");
      return;
    }
    if (formData.stock < 0) {
      alert("Stock cannot be negative.");
      return;
    }

    setSubmitting(true);

    if (formMode === "add") {
      const newBook: Omit<Book, "id"> = { ...formData };
      addBook(newBook as Book)
        .then(() => {
          refreshBooks();
          handleCancelForm();
        })
        .catch((err) => {
          console.error("Add book failed:", err?.response?.data ?? err);
          alert(
            "Failed to add book: " +
              (err?.response?.data?.message ?? err?.message ?? "Unknown error")
          );
        })
        .finally(() => setSubmitting(false));
    } else if (formMode === "edit" && editingId) {
      updateBook(editingId, { ...formData } as Book)
        .then(() => {
          refreshBooks();
          handleCancelForm();
        })
        .catch((err) => {
          console.error("Update book failed:", err?.response?.data ?? err);
          alert(
            "Failed to update book: " +
              (err?.response?.data?.message ?? err?.message ?? "Unknown error")
          );
        })
        .finally(() => setSubmitting(false));
    } else {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) =>
    deleteBook(id)
      .then(refreshBooks)
      .catch((err) => console.error("Delete book failed:", err?.response?.data ?? err));

  const handleStock = (b: Book) =>
    updateStock(b.id, b.stock + 1)
      .then(refreshBooks)
      .catch((err) => console.error("Update stock failed:", err?.response?.data ?? err));

  const filtered = books.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Catalog</div>
          <h2 className="page-title">Books</h2>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search books by title..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Author</th>
              <th>Stock</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.author}</td>
                <td className="cell-mono">{b.stock}</td>
                <td>
                  <span className={badgeClassForState(b.state)}>{b.state}</span>
                </td>
                <td>
                  <div className="cell-actions">
                    <button onClick={() => handleOpenEdit(b)} className="btn btn-update">
                      Update
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="btn btn-delete">
                      Delete
                    </button>
                    <button onClick={() => handleStock(b)} className="btn btn-stock">
                      Add Stock
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "28px", color: "var(--color-slate-light)" }}>
                  No books match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formMode === "none" && (
        <button onClick={handleOpenAdd} className="btn btn-primary">
          Add Book
        </button>
      )}

      {formMode !== "none" && (
        <div className="inline-form">
          <div className="inline-form-title">
            {formMode === "add" ? "New Book" : "Edit Book"}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="book-name">
                Name
              </label>
              <input
                id="book-name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Book title"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="book-author">
                Author
              </label>
              <input
                id="book-author"
                type="text"
                className="form-input"
                value={formData.author}
                onChange={(e) => handleFieldChange("author", e.target.value)}
                placeholder="Author name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="book-stock">
                Stock
              </label>
              <input
                id="book-stock"
                type="number"
                min={0}
                className="form-input"
                value={formData.stock}
                onChange={(e) => handleFieldChange("stock", Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="book-state">
                State
              </label>
              <select
                id="book-state"
                className="form-select"
                value={formData.state}
                onChange={(e) => handleFieldChange("state", e.target.value)}
              >
                <option value="AVAILABLE">Available</option>
                <option value="BORROWED">Borrowed</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={handleSubmitForm}
              className="btn btn-primary"
              disabled={submitting}
              style={{ marginTop: 0 }}
            >
              {submitting ? "Saving..." : formMode === "add" ? "Save Book" : "Save Changes"}
            </button>
            <button
              onClick={handleCancelForm}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}