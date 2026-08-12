import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FiPlus, FiX, FiFolder, FiCheckCircle, FiAlertCircle, FiEdit2 } from "react-icons/fi";

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: { "X-Custom-Header": "foobar" },
  withCredentials: true,
});

const EMPTY_FORM = { name: "", description: "" };

const CategoryManage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const { data } = await AxiosInstance.get("/dashboard/admin/fetch/category");
      setCategories(data.categories || []);
    } catch (error) {
      setLoadError("Couldn't load categories. Refresh the page to try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const stats = useMemo(() => {
    const described = categories.filter((c) => c.description && c.description.trim()).length;
    return {
      total: categories.length,
      described,
      missing: categories.length - described,
    };
  }, [categories]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description || "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setFormError("Category name is required.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      if (editingId) {
        await AxiosInstance.post("/dashboard/admin/category/edit", { id: editingId, name, description });
        setCategories((prev) =>
          prev.map((cat) => (cat.id === editingId ? { ...cat, name, description } : cat))
        );
      } else {
        await AxiosInstance.post("/dashboard/admin/category/add", { name, description });
        await fetchCategories();
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError(editingId ? "Couldn't update this category." : "Couldn't add this category.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen font-['Inter',sans-serif] ">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-[Newsreader,Georgia,serif] text-4xl font-extrabold tracking-tight text-[#1F2937] dark:text-[#F8FAFC]">
              Category Management
            </h1>
            <p className="mt-1 text-[#6B7280] dark:text-[#AAB4C5]">
              Manage the categories for the platform.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold
              text-white shadow-sm transition-colors hover:bg-[#16304f]
              dark:bg-[#4F8EF7] dark:text-[#0B1220] dark:hover:bg-[#3f7de0]"
          >
            <FiPlus className="h-4 w-4" />
            New category
          </button>
        </div>

        {/* Stat bar */}
        <div className="mb-8 grid grid-cols-1 divide-y divide-[#E5E7EB] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-[#243247] dark:border-[#243247] dark:bg-[#162033]">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#AAB4C5]">
                Total
              </p>
              <p className="mt-2 text-4xl font-bold text-[#1E3A5F] dark:text-[#4F8EF7]">
                {isLoading ? "—" : stats.total}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1E3A5F]/10 dark:bg-[#4F8EF7]/10">
              <FiFolder className="h-5 w-5 text-[#1E3A5F] dark:text-[#4F8EF7]" />
            </div>
          </div>

          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#AAB4C5]">
                Described
              </p>
              <p className="mt-2 text-4xl font-bold text-[#16A34A] dark:text-[#22C55E]">
                {isLoading ? "—" : stats.described}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#16A34A]/10 dark:bg-[#22C55E]/10">
              <FiCheckCircle className="h-5 w-5 text-[#16A34A] dark:text-[#22C55E]" />
            </div>
          </div>

          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#AAB4C5]">
                Missing description
              </p>
              <p className="mt-2 text-4xl font-bold text-[#D97706] dark:text-[#F59E0B]">
                {isLoading ? "—" : stats.missing}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#D97706]/10 dark:bg-[#F59E0B]/10">
              <FiAlertCircle className="h-5 w-5 text-[#D97706] dark:text-[#F59E0B]" />
            </div>
          </div>
        </div>

        {/* Section header */}
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">All Categories</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1E3A5F]/10 px-3 py-1 text-sm font-medium text-[#1E3A5F] dark:bg-[#4F8EF7]/10 dark:text-[#4F8EF7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E3A5F] dark:bg-[#4F8EF7]" />
            {isLoading ? "Loading…" : `${stats.total} total`}
          </span>
        </div>

        {/* Content panel */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white dark:border-[#243247] dark:bg-[#162033]">
          {isLoading ? (
            <div className="divide-y divide-[#E5E7EB] dark:divide-[#243247]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-5">
                  <div className="space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-[#E5E7EB] dark:bg-[#243247]" />
                    <div className="h-3 w-64 animate-pulse rounded bg-[#E5E7EB] dark:bg-[#243247]" />
                  </div>
                  <div className="h-8 w-16 animate-pulse rounded bg-[#E5E7EB] dark:bg-[#243247]" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DC2626]/10 dark:bg-[#EF4444]/10">
                <FiAlertCircle className="h-6 w-6 text-[#DC2626] dark:text-[#EF4444]" />
              </div>
              <p className="text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC]">{loadError}</p>
              <button
                onClick={fetchCategories}
                className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#1F2937]
                  transition-colors hover:bg-[#1E3A5F]/5 dark:border-[#243247] dark:text-[#F8FAFC] dark:hover:bg-white/5"
              >
                Try again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAFAF8] dark:bg-[#0B1220]">
                <FiFolder className="h-6 w-6 text-[#6B7280] dark:text-[#AAB4C5]" />
              </div>
              <p className="text-[#6B7280] dark:text-[#AAB4C5]">No categories yet</p>
              <button
                onClick={openAddModal}
                className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#1E3A5F] px-4 py-2 text-sm
                  font-semibold text-white transition-colors hover:bg-[#16304f]
                  dark:bg-[#4F8EF7] dark:text-[#0B1220] dark:hover:bg-[#3f7de0]"
              >
                <FiPlus className="h-4 w-4" />
                New category
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#E5E7EB] dark:divide-[#243247]">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E3A5F]/10 dark:bg-[#4F8EF7]/10">
                      <FiFolder className="h-4 w-4 text-[#1E3A5F] dark:text-[#4F8EF7]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1F2937] dark:text-[#F8FAFC]">
                        {category.name}
                      </p>
                      <p className="truncate text-sm text-[#6B7280] dark:text-[#AAB4C5]">
                        {category.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(category)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E5E7EB]
                      px-3 py-1.5 text-sm font-medium text-[#1F2937] transition-colors hover:bg-[#1E3A5F]/5
                      dark:border-[#243247] dark:text-[#F8FAFC] dark:hover:bg-white/5"
                  >
                    <FiEdit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#1F2937]/50 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xl dark:border-[#243247] dark:bg-[#162033]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                {editingId ? "Edit category" : "Add category"}
              </h2>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-[#1E3A5F]/5 dark:text-[#AAB4C5] dark:hover:bg-white/5"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC]">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleFormChange("name")}
                  placeholder="e.g. Web Development"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm
                    text-[#1F2937] outline-none transition-colors placeholder:text-[#6B7280]/60
                    focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10
                    dark:border-[#243247] dark:bg-[#0B1220] dark:text-[#F8FAFC]
                    dark:placeholder:text-[#AAB4C5]/50 dark:focus:border-[#4F8EF7] dark:focus:ring-[#4F8EF7]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC]">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={handleFormChange("description")}
                  placeholder="What kind of articles belong here?"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm
                    text-[#1F2937] outline-none transition-colors placeholder:text-[#6B7280]/60
                    focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10
                    dark:border-[#243247] dark:bg-[#0B1220] dark:text-[#F8FAFC]
                    dark:placeholder:text-[#AAB4C5]/50 dark:focus:border-[#4F8EF7] dark:focus:ring-[#4F8EF7]/10"
                />
              </div>

              {formError && (
                <p className="text-sm font-medium text-[#DC2626] dark:text-[#EF4444]">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#1F2937]
                    transition-colors hover:bg-[#1E3A5F]/5 disabled:opacity-50
                    dark:border-[#243247] dark:text-[#F8FAFC] dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white
                    transition-colors hover:bg-[#16304f] disabled:opacity-60
                    dark:bg-[#4F8EF7] dark:text-[#0B1220] dark:hover:bg-[#3f7de0]"
                >
                  {isSaving ? "Saving…" : editingId ? "Save changes" : "Add category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManage;