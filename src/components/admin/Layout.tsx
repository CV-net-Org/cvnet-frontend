import React from "react";
import Nav from "./Nav";

const container: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  background: "#f3f6fb",
};
const main: React.CSSProperties = {
  flex: 1,
  background: "#f3f6fb",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={container}>
      <Nav />
      <main style={main}>
        <div className="page-frame">{children}</div>
      </main>
    </div>
  );
}
