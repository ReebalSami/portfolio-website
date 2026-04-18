import type { ComponentProps, ReactNode } from "react";
import { Mermaid } from "./mermaid";
import { BlogPhoto } from "./blog-photo";
import { Polaroid } from "./polaroid";
import { SplitRow } from "./split-row";
import { B2bArchitectureDiagram } from "./b2b-architecture-diagram";

type PreProps = ComponentProps<"pre"> & {
  raw?: string;
};

type CodeProps = ComponentProps<"code"> & {
  className?: string;
  children?: ReactNode;
};

function extractText(node: ReactNode): string {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    // @ts-expect-error — ReactElement children
    return extractText(node.props?.children);
  }
  return "";
}

function CodeBlock({ className, children, ...props }: CodeProps) {
  const match = /language-(\w+)/.exec(className ?? "");
  const lang = match?.[1];

  if (lang === "mermaid") {
    const source = extractText(children).trim();
    if (source) return <Mermaid chart={source} />;
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

function PreBlock(props: PreProps) {
  const child = Array.isArray(props.children) ? props.children[0] : props.children;
  if (
    child &&
    typeof child === "object" &&
    "props" in child &&
    typeof child.props === "object" &&
    child.props !== null
  ) {
    const codeProps = child.props as CodeProps;
    const match = /language-(\w+)/.exec(codeProps.className ?? "");
    if (match?.[1] === "mermaid") {
      const source = extractText(codeProps.children).trim();
      if (source) return <Mermaid chart={source} />;
    }
  }
  return <pre {...props} />;
}

export const mdxComponents = {
  code: CodeBlock,
  pre: PreBlock,
  Mermaid,
  BlogPhoto,
  Polaroid,
  SplitRow,
  B2bArchitectureDiagram,
};
