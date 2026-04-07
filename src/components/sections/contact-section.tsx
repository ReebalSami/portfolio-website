"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";
import { LinkedInIcon, GitHubIcon } from "@/components/shared/brand-icons";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactFormSchema, type ContactFormData } from "@/lib/contact-schema";

interface ContactSectionProps {
  email: string;
  location: string;
  social: {
    linkedin: string;
    github: string;
  };
}

type FormStatus = "idle" | "sending" | "success" | "error";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ContactSection({
  email,
  location,
  social,
}: ContactSectionProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path?.[0];
        if (path && typeof path === "string") {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "", website: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <SectionHeading title="Contact" subtitle="Get In Touch" />

      <div className="grid gap-12 md:grid-cols-2">
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div>
            <Input
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div>
            <Input
              name="email"
              type="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div>
            <Input
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              aria-invalid={!!errors.subject}
              className={errors.subject ? "border-destructive" : ""}
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-destructive">{errors.subject}</p>
            )}
          </div>

          <div>
            <Textarea
              name="message"
              placeholder="Your message..."
              rows={5}
              value={formData.message}
              onChange={handleChange}
              aria-invalid={!!errors.message}
              className={errors.message ? "border-destructive" : ""}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-destructive">{errors.message}</p>
            )}
          </div>

          <div className="sr-only" aria-hidden="true">
            <Input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full cursor-pointer sm:w-auto"
            disabled={status === "sending"}
          >
            {status === "sending" ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 me-2" />
                Send Message
              </>
            )}
          </Button>

          {status === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Message sent successfully!
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              Failed to send. Please try again or email directly.
            </div>
          )}
        </motion.form>

        <motion.div
          className="space-y-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
              Direct Contact
            </h3>
            <div className="space-y-3">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {email}
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {location}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
              Social
            </h3>
            <div className="flex gap-4">
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
              <a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="GitHub"
              >
                <GitHubIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
