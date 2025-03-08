'use client'
import React, { useState, useEffect } from "react";
import { motion, MotionProps } from "framer-motion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

// EntryForm Component (Static New Entry Form)
interface EntryFormProps {
  title: string;
  content: string;
  onChange: (field: "title" | "content", value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}
const EntryForm: React.FC<EntryFormProps> = ({ title, content, onChange, onSubmit }) => (
    <MotionForm
        onSubmit={onSubmit}
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden p-6"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
    >
      <Input
          type="text"
          placeholder="Entry title"
          className="w-full px-4 py-3 text-lg font-medium bg-transparent border-b border-transparent focus:border-b-2 focus:border-violet-500 dark:focus:border-violet-400 focus:ring-0 mb-6 placeholder:text-zinc-400"
          value={title}
          onChange={(e) => onChange("title", e.target.value)}
      />
      <Textarea
          placeholder="Write your thoughts..."
          className="w-full h-64 px-4 py-3 text-base bg-transparent border border-transparent focus:border focus:border-violet-500 dark:focus:border-violet-400 focus:ring-0 resize-none placeholder:text-zinc-400"
          value={content}
          onChange={(e) => onChange("content", e.target.value)}
      />
      <div className="border-t border-zinc-100 dark:border-zinc-700 pt-4 bg-zinc-50 dark:bg-zinc-800/50">
        <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-medium py-2.5 transition-all duration-150 border-0 focus:ring-0"
        >
          Save Entry
        </Button>
      </div>
    </MotionForm>
);

// EntryCard Component
interface EntryCardProps {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
}
const EntryCard: React.FC<EntryCardProps> = ({ entry, onEdit, onDelete }) => (
    <MotionDiv
        className="group bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 className="font-semibold text-xl text-zinc-800 dark:text-zinc-100">
            {entry.title || "Untitled"}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {new Date(entry.timestamp).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
          {entry.content}
        </p>
      </div>
      <div className="border-t border-zinc-100 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          Edit
        </Button>
        <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="bg-red-500 hover:bg-red-600"
        >
          Delete
        </Button>
      </div>
    </MotionDiv>
);

// DeleteEntryDialog Component
interface DeleteEntryDialogProps {
  entry: JournalEntry;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onEdit: () => void;
}
const DeleteEntryDialog: React.FC<DeleteEntryDialogProps> = ({
                                                               entry,
                                                               isOpen,
                                                               onOpenChange,
                                                               onConfirmDelete,
                                                               onCancelDelete,
                                                               onEdit,
                                                             }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div>
          <EntryCard entry={entry} onEdit={onEdit} onDelete={() => {}} />
        </div>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-xl">Delete Entry</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            Are you sure you want to delete this entry? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-4">
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
    </Dialog>
);

// EditEntryDialog Component
interface EditEntryDialogProps {
  entry: JournalEntry;
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
  const [editTitle, setEditTitle] = useState(entry.title);
  const [editContent, setEditContent] = useState(entry.content);

  useEffect(() => {
    if (isOpen) {
      setEditTitle(entry.title);
      setEditContent(entry.content);
    }
  }, [isOpen, entry.title, entry.content]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    onConfirmEdit({ ...entry, title: editTitle, content: editContent });
  };

  return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <div />
        </DialogTrigger>
        <DialogContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Entry</DialogTitle>
          </DialogHeader>
          <MotionForm onSubmit={handleSubmit} className="p-6">
            <Input
                type="text"
                placeholder="Entry title"
                className="w-full px-4 py-3 text-lg font-medium bg-transparent border-b border-transparent focus:border-b-2 focus:border-violet-500 dark:focus:border-violet-400 focus:ring-0 mb-6 placeholder:text-zinc-400"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
            />
            <Textarea
                placeholder="Write your thoughts..."
                className="w-full h-64 px-4 py-3 text-base bg-transparent border border-transparent focus:border focus:border-violet-500 dark:focus:border-violet-400 focus:ring-0 resize-none placeholder:text-zinc-400"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="border-t border-zinc-100 dark:border-zinc-700 pt-4 bg-zinc-50 dark:bg-zinc-800/50 flex gap-3">
              <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-medium py-2.5 transition-all duration-150 border-0 focus:ring-0"
              >
                Update Entry
              </Button>
              <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelEdit}
                  className="px-6 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                Cancel
              </Button>
            </div>
          </MotionForm>
        </DialogContent>
      </Dialog>
  );
};

// Main JournalApp Component
const JournalApp = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [editDialogEntry, setEditDialogEntry] = useState<JournalEntry | null>(null);
  const [deleteDialogEntry, setDeleteDialogEntry] = useState<JournalEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load entries from localStorage on mount
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Fields are empty");
      return;
    }
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      title,
      content,
    };
    setEntries((prev) => [newEntry, ...prev]);
    toast.success("Entry created");
    setTitle("");
    setContent("");
  };

  const sortedEntries = [...entries].sort((a, b) =>
      sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
  );

  const openEditDialog = (entry: JournalEntry) => {
    setEditDialogEntry(entry);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (entry: JournalEntry) => {
    setDeleteDialogEntry(entry);
    setDeleteDialogOpen(true);
  };

  const handleConfirmEdit = (updatedEntry: JournalEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
    toast.success("Entry updated");
    setEditDialogEntry(null);
    setEditDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteDialogEntry) {
      setEntries((prev) => prev.filter((e) => e.id !== deleteDialogEntry.id));
      toast.success("Entry deleted");
      setDeleteDialogEntry(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogEntry(null);
    setDeleteDialogOpen(false);
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
            <div className="lg:col-span-2">
              <EntryForm
                  title={title}
                  content={content}
                  onChange={(field, value) => (field === "title" ? setTitle(value) : setContent(value))}
                  onSubmit={handleSubmit}
              />
            </div>
            <div className="lg:col-span-3 space-y-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
                  Entries
                </h2>
                <Select
                    value={sortOrder}
                    onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}
                >
                  <SelectTrigger className="w-[180px] border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                {sortedEntries.map((entry) => (
                    <div key={entry.id} onClick={() => openEditDialog(entry)}>
                      <EntryCard
                          entry={entry}
                          onEdit={() => openEditDialog(entry)}
                          onDelete={() => openDeleteDialog(entry)}
                      />
                    </div>
                ))}
              </div>
            </div>
          </div>
          {deleteDialogEntry && (
              <DeleteEntryDialog
                  entry={deleteDialogEntry}
                  isOpen={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                  onConfirmDelete={handleConfirmDelete}
                  onCancelDelete={handleCancelDelete}
                  onEdit={() => openEditDialog(deleteDialogEntry)}
              />
          )}
          {editDialogEntry && (
              <EditEntryDialog
                  entry={editDialogEntry}
                  isOpen={editDialogOpen}
                  onOpenChange={setEditDialogOpen}
                  onConfirmEdit={handleConfirmEdit}
                  onCancelEdit={() => {
                    setEditDialogOpen(false);
                    setEditDialogEntry(null);
                  }}
              />
          )}
        </MotionDiv>
        <Toaster />
      </MotionDiv>
  );
};

export default JournalApp;