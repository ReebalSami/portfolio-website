import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Regression: the Close button must render BEFORE the dialog children in
 * the DOM. Base UI auto-focuses the first tabbable element inside the
 * popup; if interactive content lives below the fold, browser focus ->
 * implicit scrollIntoView drags the overflow container to the bottom.
 * Close button is absolute-positioned top-right, so focusing it causes
 * no scroll.
 */
describe("DialogContent — close button DOM order", () => {
  it("renders the close button as the first interactive child of the popup", () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test description</DialogDescription>
          </DialogHeader>
          <button type="button" data-testid="primary-action">
            Primary action
          </button>
        </DialogContent>
      </Dialog>
    );

    const popup = document.querySelector<HTMLElement>(
      "[data-slot='dialog-content']"
    );
    expect(popup).not.toBeNull();

    const closeButton = popup!.querySelector<HTMLElement>(
      "[data-slot='dialog-close']"
    );
    expect(closeButton).not.toBeNull();

    const primaryAction = popup!.querySelector<HTMLElement>(
      "[data-testid='primary-action']"
    );
    expect(primaryAction).not.toBeNull();

    // Close must come strictly before the primary action in document order.
    const relation = closeButton!.compareDocumentPosition(primaryAction!);
    expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
