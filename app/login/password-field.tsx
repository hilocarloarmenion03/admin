"use client";
import { useState } from "react";
export default function PasswordField() {
  const [shown, setShown] = useState(false);
  return <div className="hq-password">
    <input id="hq-password" type={shown ? "text" : "password"} name="password" autoComplete="current-password" required />
    <button type="button" onClick={() => setShown(value => !value)} aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown}>{shown ? "Hide" : "Show"}</button>
  </div>;
}
