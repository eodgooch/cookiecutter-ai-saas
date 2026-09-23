"use client";

import { toast } from "react-hot-toast";
import config from "@/config";

async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    if (res.status === 401) {
      toast.error("Please login");
      window.location.href = config.auth.loginUrl;
      throw new Error("Unauthorized");
    }

    if (res.status === 403) {
      toast.error("Pick a plan to use this feature");
      throw new Error("Forbidden");
    }

    const data = await res.json().catch(() => ({}));
    const message = data?.error || res.statusText || "Something went wrong";
    toast.error(message);
    throw new Error(message);
  }

  return res.json();
}

export default apiClient;
