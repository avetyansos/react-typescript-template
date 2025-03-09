"use client";
import React, { useState, useEffect } from "react";
import { motion, MotionProps } from "framer-motion";
import { toast, Toaster } from "sonner";

import { CheckCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Create custom motion components with proper HTML props
const MotionForm = motion("form") as React.ComponentType<
    React.FormHTMLAttributes<HTMLFormElement> & MotionProps
>;
const MotionDiv = motion("div") as React.ComponentType<
    React.HTMLAttributes<HTMLDivElement> & MotionProps
>;

// Types & Interfaces
interface JournalEntry {
  id: string;
  timestamp: number;
  title: string;
  content: string;
}

// Header Component
const Header = () => (
    <header className="text-center mb-12">
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mb-3">
        Journal
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-lg">
        Capture your thoughts and reflections
      </p>
    </header>
);

const EmptyState = () => {
  return (
      <div className="flex flex-col items-center justify-center py-10 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
        <div className="text-4xl">📝</div>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          No entries yet. Your thoughts will appear here.
        </p>
      </div>
  );
};

interface EntryFormProps {
  title: string;
  content: string;
  titleError: string;
  contentError: string;
  onChange: (field: "title" | "content", value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}
const EntryForm: React.FC<EntryFormProps> = ({
                                               title,
                                               content,
                                               titleError,
                                               contentError,
                                               onChange,
                                               onSubmit,
                                             }) => (
    <MotionForm
        onSubmit={onSubmit}
        className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 px-6 py-4"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
    >
      {/* Title */}
      <div className="mb-4">
        <Input
            type="text"
            placeholder="Entry title"
            className={`w-full text-lg font-medium rounded-md px-4 py-2 
          border bg-transparent placeholder:text-zinc-400
          focus:outline-none focus:ring-0
          ${
                titleError
                    ? "border-red-600 focus:border-red-600"
                    : "border-zinc-300 dark:border-zinc-700 focus:border-violet-500"
            }`}
            value={title}
            onChange={(e) => onChange("title", e.target.value)}
        />
        {titleError && (
            <p className="text-red-600 text-sm mt-1">{titleError}</p>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <Textarea
            placeholder="Write your thoughts..."
            className={`w-full h-48 px-4 py-2 rounded-md
          border bg-transparent placeholder:text-zinc-400
          focus:outline-none focus:ring-0 resize-none
          ${
                contentError
                    ? "border-red-600 focus:border-red-600"
                    : "border-zinc-300 dark:border-zinc-700 focus:border-violet-500"
            }`}
            value={content}
            onChange={(e) => onChange("content", e.target.value)}
        />
        {contentError && (
            <p className="text-red-600 text-sm mt-1">{contentError}</p>
        )}
      </div>

      {/* Footer with CTA */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-4 flex justify-end">
        <Button
            type="submit"
            className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-medium py-2.5 border-0 focus:ring-0"
        >
          Save Entry
        </Button>
      </div>
    </MotionForm>
);

// EntryCard Component
interface EntryCardProps {
  entry: JournalEntry;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
const EntryCard: React.FC<EntryCardProps> = ({
                                               entry,
                                               isSelected,
                                               onSelect,
                                               onEdit,
                                               onDelete,
                                             }) => (
    <MotionDiv
        className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden relative cursor-pointer h-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onSelect}
    >
      {/* Content area */}
      <div className="p-4 h-full overflow-auto">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold text-base text-zinc-800 dark:text-zinc-100">
            {entry.title || "Untitled"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {new Date(entry.timestamp).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
          {entry.content}
        </p>
      </div>

      {/* Buttons fixed at bottom - show if selected */}
      {isSelected && (
          <div
              className="absolute bottom-0 left-0 right-0 flex justify-end gap-2 p-2
          bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700"
          >
            <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-sm text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              Edit
            </Button>
            <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-sm bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </div>
      )}
    </MotionDiv>
);

interface DeleteEntryDialogProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}
const DeleteEntryDialog: React.FC<DeleteEntryDialogProps> = ({
                                                               entry,
                                                               isOpen,
                                                               onOpenChange,
                                                               onConfirmDelete,
                                                               onCancelDelete,
                                                             }) => {
  if (!entry) return null;

  return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogPortal>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/30" />
          {/* Centered Content, no slide animation */}
          <DialogContent
              className={`bg-white dark:bg-zinc-800 
            border border-zinc-200 dark:border-zinc-700 rounded-lg
            w-full max-w-sm 
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            focus:outline-none
            data-[state=open]:animate-none data-[state=closed]:animate-none
            px-6 py-4`}
          >
            <DialogHeader className="p-0">
              <DialogTitle className="text-xl mb-2">Delete Entry</DialogTitle>
              <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                Are you sure you want to delete this entry? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="p-0 mt-4 flex justify-end gap-2">
              <Button
                  variant="outline"
                  onClick={onCancelDelete}
                  className="border-zinc-200 dark:border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                  variant="destructive"
                  onClick={onConfirmDelete}
                  className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
  );
};

interface EditEntryDialogProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmEdit: (updatedEntry: JournalEntry) => void;
  onCancelEdit: () => void;
}
const EditEntryDialog: React.FC<EditEntryDialogProps> = ({
                                                           entry,
                                                           isOpen,
                                                           onOpenChange,
                                                           onConfirmEdit,
                                                           onCancelEdit,
                                                         }) => {
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    if (isOpen && entry) {
      setEditTitle(entry.title);
      setEditContent(entry.content);
      setTitleError("");
      setContentError("");
    }
  }, [isOpen, entry]);

  if (!entry) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let valid = true;

    if (!editTitle.trim()) {
      setTitleError("Title is required");
      valid = false;
    } else {
      setTitleError("");
    }
    if (!editContent.trim()) {
      setContentError("Content is required");
      valid = false;
    } else {
      setContentError("");
    }
    if (!valid) return;

    onConfirmEdit({ ...entry, title: editTitle, content: editContent });
  };

  return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogPortal>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/30" />
          {/* Centered Content, no slide animation */}
          <DialogContent
              className={`bg-white dark:bg-zinc-800 
            border border-zinc-200 dark:border-zinc-700 rounded-lg
            w-full max-w-lg 
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            focus:outline-none
            data-[state=open]:animate-none data-[state=closed]:animate-none
            px-6 py-4`}
          >
            <div>
              <DialogHeader className="p-0 mb-4">
                <DialogTitle className="text-xl">Edit Entry</DialogTitle>
              </DialogHeader>

              <MotionForm onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                      type="text"
                      placeholder="Entry title"
                      className={`w-full text-base rounded-md px-4 py-2 
                    bg-transparent placeholder:text-zinc-400
                    focus:outline-none focus:ring-0
                    ${
                          titleError
                              ? "border-red-600 focus:border-red-600"
                              : "border border-zinc-300 dark:border-zinc-700 focus:border-violet-500"
                      }`}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                  />
                  {titleError && (
                      <p className="text-red-600 text-sm mt-1">{titleError}</p>
                  )}
                </div>

                <div>
                  <Textarea
                      placeholder="Write your thoughts..."
                      className={`w-full h-40 px-4 py-2 rounded-md
                    bg-transparent placeholder:text-zinc-400
                    focus:outline-none focus:ring-0 resize-none
                    ${
                          contentError
                              ? "border-red-600 focus:border-red-600"
                              : "border border-zinc-300 dark:border-zinc-700 focus:border-violet-500"
                      }`}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                  />
                  {contentError && (
                      <p className="text-red-600 text-sm mt-1">{contentError}</p>
                  )}
                </div>

                <DialogFooter className="p-0 flex justify-end gap-2">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={onCancelEdit}
                      className="border-zinc-200 dark:border-zinc-700"
                  >
                    Cancel
                  </Button>
                  <Button
                      type="submit"
                      className="bg-violet-500 hover:bg-violet-600 text-white font-medium py-2.5 border-0"
                  >
                    Save
                  </Button>
                </DialogFooter>
              </MotionForm>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
  );
};

const JournalApp = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [editDialogEntry, setEditDialogEntry] = useState<JournalEntry | null>(
      null
  );
  const [deleteDialogEntry, setDeleteDialogEntry] =
      useState<JournalEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("journalEntries");
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(entries));
  }, [entries]);

  // Form submission for new entry
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let valid = true;
    if (!title.trim()) {
      setTitleError("Title is required");
      valid = false;
    } else {
      setTitleError("");
    }
    if (!content.trim()) {
      setContentError("Content is required");
      valid = false;
    } else {
      setContentError("");
    }
    if (!valid) return;

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      title,
      content,
    };
    setEntries((prev) => [newEntry, ...prev]);
    toast.success("Entry created", {
      icon: <CheckCircle size={24} className="text-[#00BE64]" />,
    });
    setTitle("");
    setContent("");
  };

  // Sorting
  const sortedEntries = [...entries].sort((a, b) =>
      sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
  );

  const openEditDialog = (entry: JournalEntry) => {
    setEditDialogEntry(entry);
    setEditDialogOpen(true);
  };
  const handleConfirmEdit = (updatedEntry: JournalEntry) => {
    setEntries((prev) =>
        prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
    toast.success("Entry updated", {
      icon: <CheckCircle size={24} className="text-[#00BE64]" />,
    });
    setEditDialogEntry(null);
    setEditDialogOpen(false);
  };

  const openDeleteDialog = (entry: JournalEntry) => {
    setDeleteDialogEntry(entry);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = () => {
    if (deleteDialogEntry) {
      setEntries((prev) => prev.filter((e) => e.id !== deleteDialogEntry.id));
      toast.success("Entry deleted", {
        icon: <CheckCircle size={24} className="text-[#00BE64]" />,
      });
      setDeleteDialogEntry(null);
      setDeleteDialogOpen(false);
    }
  };

  const toggleSelectCard = (id: string) => {
    setSelectedEntryId((prev) => (prev === id ? null : id));
  };

  return (
      <MotionDiv
          className="min-h-screen bg-[#fafafa] dark:bg-zinc-900 p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
      >
        <MotionDiv className="max-w-7xl mx-auto" initial={{ y: 20 }} animate={{ y: 0 }}>
          <Header />

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column: New Entry Form */}
            <div className="lg:col-span-2">
              <EntryForm
                  title={title}
                  content={content}
                  titleError={titleError}
                  contentError={contentError}
                  onChange={(field, value) =>
                      field === "title" ? setTitle(value) : setContent(value)
                  }
                  onSubmit={handleSubmit}
              />
            </div>

            {/* Right Column: Entries list or empty state */}
            <div className="lg:col-span-3 space-y-6">
              {entries.length > 0 ? (
                  <>
                    {/* Sorting */}
                    <div className="flex justify-between items-center">
                      <Select
                          value={sortOrder}
                          onValueChange={(value: "newest" | "oldest") =>
                              setSortOrder(value)
                          }
                      >
                        <SelectTrigger className="w-[180px] border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-0 focus:outline-none">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* List of Entries */}
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                      {sortedEntries.map((entry) => (
                          <EntryCard
                              key={entry.id}
                              entry={entry}
                              isSelected={selectedEntryId === entry.id}
                              onSelect={() => toggleSelectCard(entry.id)}
                              onEdit={() => openEditDialog(entry)}
                              onDelete={() => openDeleteDialog(entry)}
                          />
                      ))}
                    </div>
                  </>
              ) : (
                  <EmptyState />
              )}
            </div>
          </div>

          {/* Delete Entry Dialog */}
          <DeleteEntryDialog
              entry={deleteDialogEntry}
              isOpen={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onConfirmDelete={handleConfirmDelete}
              onCancelDelete={() => {
                setDeleteDialogEntry(null);
                setDeleteDialogOpen(false);
              }}
          />

          {/* Edit Entry Dialog */}
          <EditEntryDialog
              entry={editDialogEntry}
              isOpen={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              onConfirmEdit={handleConfirmEdit}
              onCancelEdit={() => {
                setEditDialogEntry(null);
                setEditDialogOpen(false);
              }}
          />
        </MotionDiv>

        {/* Toaster with bottom-left positioning */}
        <Toaster position="bottom-left" />
      </MotionDiv>
  );
};

export default JournalApp;