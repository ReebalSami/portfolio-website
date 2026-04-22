import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

// Mock the chat-layout-context hooks to avoid ResizeObserver/DOM measurement
// requirements in jsdom. The context has a NULL_VALUE default so the hooks are
// safe to no-op in tests, but explicit mocks make the intent crystal-clear.
vi.mock("@/lib/layout/chat-layout-context", () => ({
  useRegisterChatButton: vi.fn(),
  useRegisterChatDialog: vi.fn(),
}));

import { ChatWidget } from "@/components/chat/chat-widget";

const MESSAGES = {
  chatbot: {
    toggle: "Toggle chat",
    title: "AI Assistant",
    subtitle: "Ask me anything",
    welcome: "Hi there",
    disclaimer: "AI may be wrong",
    error: "Something went wrong",
    rateLimit: "Too many requests",
    placeholder: "Type a message...",
    send: "Send",
  },
};

/**
 * Build a minimal streaming Response whose body resolves immediately (done=true
 * on the first read). This prevents the ChatWidget's reader loop from hanging
 * in jsdom where ReadableStream.getReader() is available but may stall.
 */
function makeStreamingResponse(status = 200): Response {
  const stream = new ReadableStream({
    start(controller) {
      controller.close();
    },
  });
  return new Response(stream, {
    status,
    headers: { "Content-Type": "text/plain" },
  });
}

describe("ChatWidget locale transmission", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(makeStreamingResponse(200));
    global.fetch = fetchMock;
  });

  it("sends locale in POST body when a message is submitted", async () => {
    render(
      <NextIntlClientProvider locale="ar" messages={MESSAGES}>
        <ChatWidget />
      </NextIntlClientProvider>
    );

    // The widget starts closed — open it by clicking the toggle button
    const toggleBtn = screen.getByLabelText("Toggle chat");
    await act(async () => {
      toggleBtn.click();
    });

    // Find the text input rendered by ChatInput
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    // Type a message and submit the form
    await act(async () => {
      fireEvent.change(input, { target: { value: "مرحبا" } });
    });

    await act(async () => {
      fireEvent.submit(input.closest("form")!);
    });

    // Verify fetch was called exactly once
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Parse the POST body and assert locale is present and correct
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/chat");
    expect(init.method).toBe("POST");

    const body = JSON.parse(init.body as string) as {
      locale: string;
      messages: { role: string; content: string }[];
    };

    expect(body.locale).toBe("ar");
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].role).toBe("user");
    expect(body.messages[0].content).toBe("مرحبا");
  });

  it("sends the correct locale for each supported locale", async () => {
    for (const locale of ["en", "de", "es", "ar"]) {
      fetchMock.mockClear();
      fetchMock.mockResolvedValue(makeStreamingResponse(200));

      const { unmount } = render(
        <NextIntlClientProvider locale={locale} messages={MESSAGES}>
          <ChatWidget />
        </NextIntlClientProvider>
      );

      const toggleBtn = screen.getByLabelText("Toggle chat");
      await act(async () => {
        toggleBtn.click();
      });

      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "hello" } });
      });
      await act(async () => {
        fireEvent.submit(input.closest("form")!);
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const body = JSON.parse(
        (fetchMock.mock.calls[0][1] as RequestInit).body as string
      ) as { locale: string };
      expect(body.locale).toBe(locale);

      unmount();
    }
  });
});
