import React from "react";

export default function DateAndTime() {
  const now = new Date();

  const formatted = now.toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return <div style={{fontSize : "14px"}}>Last Updated – {formatted}</div>;
}
