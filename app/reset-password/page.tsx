
"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Password changed successfully!");

      window.location.href = "/login";
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#090909",
      padding: "20px"
    }}>
      <form
        onSubmit={handleReset}
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#171717",
          padding: "30px",
          borderRadius: "15px",
          color: "white"
        }}
      >
        <h1 style={{ color: "#ff3b91", marginBottom: "10px" }}>
          Reset Password
        </h1>

        <p style={{ color: "#aaa", marginBottom: "25px" }}>
          Enter your new Mingle-Connect password.
        </p>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "#ff3b91",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #444",
  background: "#252525",
  color: "white",
  boxSizing: "border-box" as const
};

