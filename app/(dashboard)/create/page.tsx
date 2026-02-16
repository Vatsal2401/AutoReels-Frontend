"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirect legacy /create URL to /studio/reel. */
export default function CreateVideoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/studio/reel");
  }, [router]);

  return null;
}
