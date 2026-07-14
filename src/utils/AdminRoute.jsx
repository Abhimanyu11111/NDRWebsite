import useBfcacheReload from "./useBfcacheReload";

export default function AdminRoute({ children }) {
  useBfcacheReload();
  return children;
}
