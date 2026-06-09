import { contextBridge } from "electron";

contextBridge.exposeInMainWorld(
    "zcolor",
    {
        storage: {
            async get(key: string) {
                const value = localStorage.getItem(key);

                return {
                    [key]: value
                        ? JSON.parse(value)
                        : null
                };
            },

            async set(data: any) {
                Object.entries(data).forEach(
                    ([k, v]) => {
                        localStorage.setItem(
                            k,
                            JSON.stringify(v)
                        );
                    }
                );
            }
        }
    }
);