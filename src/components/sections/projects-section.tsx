"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { GitHubIcon } from "@/components/shared/brand-icons";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProjectCard } from "@/components/cards/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  projectsData,
  projectCategories,
  type Project,
  type ProjectCategory,
} from "@/content/projects";
import { cn } from "@/lib/utils";

export function ProjectsSection() {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered =
    filter === "all"
      ? projectsData
      : projectsData.filter((p) => p.category.includes(filter));

  return (
    <div>
      <SectionHeading title="Projects" subtitle="Selected Work" />

      <div className="flex flex-wrap gap-2 mb-8">
        {projectCategories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer",
              filter === cat.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              onSelect={setSelected}
            />
          ))}
        </AnimatePresence>
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {selected && (
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selected.title}</DialogTitle>
              <DialogDescription className="text-sm">
                {selected.metric}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selected.fullDescription}
              </p>

              <div>
                <h4 className="text-sm font-medium mb-2">Key Highlights</h4>
                <ul className="space-y-1">
                  {selected.highlights.map((h) => (
                    <li
                      key={h}
                      className="text-sm text-muted-foreground flex gap-2"
                    >
                      <span className="text-gallery-warm mt-1">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Technologies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tech.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {selected.githubUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    nativeButton={false}
                    render={
                      <a
                        href={selected.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <GitHubIcon className="h-4 w-4 me-2" />
                    GitHub
                  </Button>
                )}
                {selected.demoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    nativeButton={false}
                    render={
                      <a
                        href={selected.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <ExternalLink className="h-4 w-4 me-2" />
                    Live Demo
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
