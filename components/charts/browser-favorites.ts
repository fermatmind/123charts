"use client";
import { useEffect, useRef, useState } from "react";
import type { Bootstrap, Dataset } from "@/lib/charts/types";
import { orderedIds } from "@/lib/charts/navigation";
type Api = <T = any>(route: string, body?: unknown) => Promise<T>;
const read = (key: string): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};
function write(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}
export function useBrowserFavorites(
  data: Bootstrap,
  dataset: Dataset,
  api: Api,
  notify: (s: string) => void,
  zh: boolean,
) {
  const guestKey = `123charts:favorites:${dataset}:guest`,
    owner = data.user?.id,
    key = `123charts:favorites:${dataset}:${owner || "guest"}`;
  const serverIds = data.follows
      .filter(
        (f) =>
          f.kind === "bookmark" &&
          (data.projects.some((p) => p.id === f.target) ||
            read(key).includes(f.target)),
      )
      .map((f) => f.target),
    signature = serverIds.join(",");
  const [state, setState] = useState<{ key: string; ids: string[] }>({
    key: "",
    ids: [],
  });
  const [storageError, setStorageError] = useState(false),
    [sync, setSync] = useState(""),
    [retry, setRetry] = useState(0);
  const merging = useRef<string | null>(null),
    busy = useRef(new Set<string>());
  useEffect(() => {
    setState({
      key,
      ids: owner ? orderedIds(read(key), serverIds) : read(key),
    });
  }, [key, signature, owner]); // eslint-disable-line react-hooks/exhaustive-deps
  const ids = state.key === key ? state.ids : [];
  const currentIds = useRef(ids),
    currentKey = useRef(key);
  currentIds.current = ids;
  currentKey.current = key;
  const persist = (next: string[]) => {
    try {
      write(key, next);
      currentIds.current = next;
      setState({ key, ids: next });
    } catch {
      setStorageError(true);
      notify(
        zh
          ? owner
            ? "账号收藏已保存，但浏览器无法保存本机排序。"
            : "浏览器未允许保存，请检查存储设置。"
          : owner
            ? "Account favorite saved; browser order could not be stored."
            : "Browser storage is unavailable. Favorites were not saved.",
      );
    }
  };
  useEffect(() => {
    if (!owner || merging.current === key) return;
    const guests = read(guestKey);
    if (!guests.length) {
      setSync("");
      return;
    }
    merging.current = key;
    let cancelled = false;
    setSync("merging");
    void (async () => {
      try {
        const account = [...serverIds];
        for (const id of guests) {
          if (cancelled) break;
          if (!data.projects.some((p) => p.id === id)) continue;
          if (!account.includes(id)) {
            await api("follow", { kind: "bookmark", target: id });
            account.push(id);
          }
          // Consume each successful item. Removing it later cannot resurrect it on login.
          write(
            guestKey,
            read(guestKey).filter((x) => x !== id),
          );
          write(key, orderedIds(read(key), account));
        }
        if (!cancelled) {
          setState({ key, ids: orderedIds(read(key), account) });
          setSync("done");
        }
      } catch {
        if (!cancelled) setSync("failed");
      } finally {
        if (merging.current === key) merging.current = null;
      }
    })();
    return () => {
      cancelled = true;
      if (merging.current === key) merging.current = null;
    };
  }, [owner, key, guestKey, retry]); // eslint-disable-line react-hooks/exhaustive-deps
  async function toggle(id: string) {
    if (busy.current.has(id)) return;
    busy.current.add(id);
    try {
      const active = ids.includes(id);
      if (owner)
        await api("follow", { kind: "bookmark", target: id, remove: active });
      if (currentKey.current !== key) return;
      persist(
        active
          ? currentIds.current.filter((x) => x !== id)
          : [...new Set([...currentIds.current, id])],
      );
    } finally {
      busy.current.delete(id);
    }
  }
  function move(id: string, direction: -1 | 1) {
    const i = ids.indexOf(id),
      j = i + direction;
    if (i < 0 || j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  }
  return {
    favoriteIds: ids,
    favoritesReady: state.key === key,
    toggleFavorite: toggle,
    moveFavorite: move,
    favoriteSync: sync,
    favoriteStorageError: storageError,
    retryFavoriteSync: () => setRetry((v) => v + 1),
  };
}
