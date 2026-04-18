import { visit } from "unist-util-visit";

interface MdNode {
  type: string;
  lang?: string | null;
  value?: string;
  children?: MdNode[];
}

/**
 * Remark plugin that replaces ```mermaid fenced code blocks with a
 * <Mermaid chart="..." /> JSX element BEFORE rehype-shiki sees them.
 *
 * Without this, rehype-shiki treats `mermaid` as an unknown language,
 * strips the `language-mermaid` className and wraps content in
 * highlighted token spans, which prevents downstream MDX component
 * resolution from detecting the fence.
 *
 * Result: the MDX `Mermaid` component (registered in mdxComponents)
 * receives the raw chart source as a `chart` prop.
 */
export function remarkMermaid() {
  return (tree: MdNode) => {
    visit(
      tree as never,
      "code",
      (node: MdNode, index: number | undefined, parent: MdNode | undefined) => {
        if (!parent || typeof index !== "number") return;
        if (node.lang !== "mermaid") return;

        const replacement: MdNode = {
          type: "mdxJsxFlowElement",
          ...({
            name: "Mermaid",
            attributes: [
              {
                type: "mdxJsxAttribute",
                name: "chart",
                value: node.value ?? "",
              },
            ],
          } as Record<string, unknown>),
          children: [],
        };

        parent.children?.splice(index, 1, replacement);
      }
    );
  };
}
