import { useEffect } from "react";

// Browsers can restore a page from the back-forward cache (bfcache) on
// history navigation without re-running any JS or network requests. If the
// user logs out (hard redirect) and then hits Back, the previous protected
// page would otherwise reappear exactly as it was, skipping the 401 check
// that normally redirects unauthenticated users to login. Forcing a reload
// on a bfcache restore re-triggers that check.
export default function useBfcacheReload() {
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);
}
