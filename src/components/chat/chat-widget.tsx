"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import {
  useRegisterChatButton,
  useRegisterChatDialog,
} from "@/lib/layout/chat-layout-context";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Refs published into ChatLayoutContext so any other fixed/floating UI
  // (currently: CV MorphingDownloadCta FAB) can position itself above the
  // chat without a DOM query. Button ref stays live for the widget's whole
  // lifetime; dialog ref only has a node while the dialog is mounted.
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useRegisterChatButton(buttonRef);
  useRegisterChatDialog(dialogRef, open);
  const t = useTranslations("chatbot");

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (content: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errorText =
          res.status === 429
            ? t("rateLimit")
            : (err as { error?: string }).error ?? t("error");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: errorText } : m
          )
        );
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: t("error") } : m
          )
        );
        setIsLoading(false);
        return;
      }

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: accumulated } : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: t("error") } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <Button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        size="icon"
        className={cn(
          "fixed bottom-6 end-6 z-50 h-14 w-14 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105",
          open && "rotate-90"
        )}
        aria-label={t("toggle")}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat dialog */}
      {open && (
        <div
          ref={dialogRef}
          className="fixed bottom-24 end-6 z-50 w-[calc(100vw-3rem)] max-w-sm rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gallery-warm/20">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t("title")}</p>
              <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ maxHeight: "24rem", minHeight: "12rem" }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Bot className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t("welcome")}
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {isLoading &&
              messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gallery-warm/20">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl bg-muted px-3.5 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Input + disclaimer */}
          <div className="border-t border-border p-3 space-y-2">
            <ChatInput onSend={handleSend} disabled={isLoading} />
            <p className="text-[10px] text-center text-muted-foreground/60">
              {t("disclaimer")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
