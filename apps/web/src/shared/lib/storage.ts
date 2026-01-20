export const STORAGE_KEYS = {
	TOKEN: "@devinn:token",
	TENANT_ID: "@devinn:tenant_id",
	THEME: "@devinn:theme",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const storage = {
	get(key: StorageKey): string | null {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(key);
	},

	set(key: StorageKey, value: string): void {
		if (typeof window === "undefined") return;
		localStorage.setItem(key, value);
	},

	remove(key: StorageKey): void {
		if (typeof window === "undefined") return;
		localStorage.removeItem(key);
	},

	clear(): void {
		if (typeof window === "undefined") return;
		localStorage.clear();
	},
};
