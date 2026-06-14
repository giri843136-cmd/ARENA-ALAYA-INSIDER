/**
 * Toast Store Tests
 *
 * Tests the Zustand-based toast notification store.
 * Pure state management — no DOM required.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useToastStore, toast } from "@/lib/toast/store";

describe("Toast Store", () => {
  beforeEach(() => {
    // Reset store before each test
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("addToast", () => {
    it("adds a toast to the store", () => {
      const id = useToastStore.getState().addToast({
        type: "success",
        title: "Saved",
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe(id);
      expect(state.toasts[0].type).toBe("success");
      expect(state.toasts[0].title).toBe("Saved");
    });

    it("adds a toast with optional message and action", () => {
      const action = { label: "Undo", onClick: vi.fn() };
      useToastStore.getState().addToast({
        type: "info",
        title: "Item removed",
        message: "You can undo this action",
        action,
      });

      const toast = useToastStore.getState().toasts[0];
      expect(toast.message).toBe("You can undo this action");
      expect(toast.action?.label).toBe("Undo");
    });

    it("returns a unique ID for each toast", () => {
      const id1 = useToastStore.getState().addToast({ type: "success", title: "One" });
      const id2 = useToastStore.getState().addToast({ type: "error", title: "Two" });

      expect(id1).not.toBe(id2);
    });

    it("generates unique IDs even in rapid succession", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const id = useToastStore.getState().addToast({ type: "info", title: `Toast ${i}` });
        ids.add(id);
      }
      expect(ids.size).toBe(10);
    });

    it("auto-dismisses toast after the default duration", () => {
      vi.useFakeTimers();

      useToastStore.getState().addToast({ type: "success", title: "Auto dismiss" });
      expect(useToastStore.getState().toasts).toHaveLength(1);

      // Advance past default duration (4000ms)
      vi.advanceTimersByTime(4001);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("auto-dismisses toast after custom duration", () => {
      vi.useFakeTimers();

      useToastStore.getState().addToast({ type: "warning", title: "Custom", duration: 1000 });
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(999);
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(2);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("does not auto-dismiss when duration is 0", () => {
      vi.useFakeTimers();

      useToastStore.getState().addToast({ type: "error", title: "Persistent", duration: 0 });
      vi.advanceTimersByTime(100000);
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it("does not auto-dismiss when duration is negative", () => {
      vi.useFakeTimers();

      useToastStore.getState().addToast({ type: "info", title: "Sticky", duration: -1 });
      vi.advanceTimersByTime(100000);
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
  });

  describe("removeToast", () => {
    it("removes a toast by ID", () => {
      const id = useToastStore.getState().addToast({ type: "success", title: "Remove me" });
      expect(useToastStore.getState().toasts).toHaveLength(1);

      useToastStore.getState().removeToast(id);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("removes only the specified toast", () => {
      const id1 = useToastStore.getState().addToast({ type: "success", title: "First" });
      const id2 = useToastStore.getState().addToast({ type: "error", title: "Second" });

      useToastStore.getState().removeToast(id1);
      expect(useToastStore.getState().toasts).toHaveLength(1);
      expect(useToastStore.getState().toasts[0].title).toBe("Second");
    });

    it("does nothing when removing a non-existent ID", () => {
      useToastStore.getState().addToast({ type: "success", title: "Only" });
      useToastStore.getState().removeToast("nonexistent-id");
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
  });

  describe("clearAll", () => {
    it("removes all toasts", () => {
      useToastStore.getState().addToast({ type: "success", title: "A" });
      useToastStore.getState().addToast({ type: "error", title: "B" });
      useToastStore.getState().addToast({ type: "info", title: "C" });

      useToastStore.getState().clearAll();
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("works on an empty store", () => {
      useToastStore.getState().clearAll();
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe("toast helpers", () => {
    it("toast.success adds a success toast", () => {
      const id = toast.success("Success title", "Optional message");
      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].type).toBe("success");
      expect(state.toasts[0].title).toBe("Success title");
      expect(state.toasts[0].message).toBe("Optional message");
      expect(state.toasts[0].id).toBe(id);
    });

    it("toast.error adds an error toast", () => {
      toast.error("Error title");
      expect(useToastStore.getState().toasts[0].type).toBe("error");
    });

    it("toast.warning adds a warning toast", () => {
      toast.warning("Warning title");
      expect(useToastStore.getState().toasts[0].type).toBe("warning");
    });

    it("toast.info adds an info toast", () => {
      toast.info("Info title");
      expect(useToastStore.getState().toasts[0].type).toBe("info");
    });

    it("all helpers return the toast ID", () => {
      const ids = [
        toast.success("S"),
        toast.error("E"),
        toast.warning("W"),
        toast.info("I"),
      ];
      expect(ids).toHaveLength(4);
      ids.forEach((id) => expect(typeof id).toBe("string"));
    });

    it("helpers accept custom duration", () => {
      vi.useFakeTimers();
      toast.success("Quick", "dismiss fast", 500);
      vi.advanceTimersByTime(501);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe("State Integrity", () => {
    it("toasts array is empty initially", () => {
      expect(useToastStore.getState().toasts).toEqual([]);
    });

    it("maintains insertion order", () => {
      useToastStore.getState().addToast({ type: "info", title: "First" });
      useToastStore.getState().addToast({ type: "info", title: "Second" });
      useToastStore.getState().addToast({ type: "info", title: "Third" });

      const titles = useToastStore.getState().toasts.map((t) => t.title);
      expect(titles).toEqual(["First", "Second", "Third"]);
    });
  });
});
