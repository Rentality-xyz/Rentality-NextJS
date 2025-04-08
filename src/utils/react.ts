import React from "react";

export function assertIsNode(event: EventTarget | null): asserts event is Node {
  if (!event || !("nodeType" in event)) {
    throw new Error(`Node expected`);
  }
}

export function extractTextFromReactNode(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).join("");
  }

  if (React.isValidElement(node)) {
    return extractTextFromReactNode(node.props.children);
  }

  return "";
}
