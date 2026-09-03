import React, { useState } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import { Switch } from '@headlessui/react';
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from '../../../contexts/ThemeContext';
import {
  Moon, Lock, Eye, EyeOff, Check, Loader2, AlertTriangle, Trash2, X
} from 'lucide-react';

const ContriSettings = () => {
  const { isDarkMode, toggleDark } = useTheme();
  const { setLoggedIn } = useAuth();

  // ---- Password change ----
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePassword = () => {
    setPwError("");
    setPwSuccess(false);

    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setPwError("Fill in all password fields.");
      return;
    }
    if (passwordForm.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPwError("New password and confirmation don't match.");
      return;
    }

    setPwSaving(true);
    try {
      AxiosInstance.put('/dashboard/contri/settings/password', {
        current_password: passwordForm.current,
        new_password: passwordForm.next,
      })
        .then(() => {
          setPwSuccess(true);
          setPasswordForm({ current: "", next: "", confirm: "" });
          setPwSaving(false);
        })
        .catch((err) => {
          console.log(err);
          setPwError(err.response?.data?.message || "Couldn't update password. Check your current password.");
          setPwSaving(false);
        });
    } catch (error) {
      console.log(error);
      setPwError("Couldn't update password. Try again.");
      setPwSaving(false);
    }
  };

  // ---- Delete account ----
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handle_delete_account = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await AxiosInstance.delete('/dashboard/contri/delete');
      console.log(response.data);
      setLoggedIn(false);
    }
    catch (error) {
      console.log(error);
      setDeleteError("Couldn't delete your account. Please try again.");
    }
    setIsDeleting(false);
  }

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header */}
      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Manage your preferences and account
        </p>
      </div>

      {/* Dark Mode */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <Moon className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Dark Mode</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Enable or disable dark mode</p>
          </div>
        </div>
        <Switch
          checked={isDarkMode}
          onChange={toggleDark}
          className={`${
            isDarkMode ? 'bg-[#1E3A5F]' : 'bg-gray-300 dark:bg-slate-600'
          } relative inline-flex items-center h-6 rounded-full w-11 shrink-0 transition-colors duration-150`}
        >
          <span className="sr-only">Toggle Dark Mode</span>
          <span
            className={`${
              isDarkMode ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-150`}
          />
        </Switch>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Change Password</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Update the password on your account</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: "current", label: "Current Password" },
            { key: "next", label: "New Password" },
            { key: "confirm", label: "Confirm New Password" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
                {label}
              </label>
              <div className="relative">
                <input
                  type={showPw[key] ? "text" : "password"}
                  value={passwordForm[key]}
                  onChange={(e) => {
                    setPasswordForm((f) => ({ ...f, [key]: e.target.value }));
                    setPwSuccess(false);
                  }}
                  className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {pwError && <p className="text-xs font-medium text-red-600 dark:text-red-400">{pwError}</p>}
          {pwSuccess && <p className="text-xs font-medium text-green-600 dark:text-green-400">Password updated successfully.</p>}

          <button
            onClick={handleChangePassword}
            disabled={pwSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150 disabled:opacity-50"
          >
            {pwSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/40 rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Delete Account</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              Permanently remove your account and all your data
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mt-3 mb-4">
          This action cannot be undone. Your reads, bookmarks, likes, and comments will be permanently deleted.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account
          </button>
        ) : (
          <div className="border border-red-200 dark:border-red-900/40 rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10 space-y-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
              Type <span className="font-mono font-bold">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400"
            />

            {deleteError && <p className="text-xs font-medium text-red-600 dark:text-red-400">{deleteError}</p>}

            <div className="flex items-center gap-2">
              <button
                onClick={handle_delete_account}
                disabled={confirmText !== "DELETE" || isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {isDeleting ? "Deleting…" : "Permanently Delete"}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setConfirmText(""); setDeleteError(""); }}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150 disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ContriSettings;