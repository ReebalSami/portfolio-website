import { TransitionLink } from "@/components/shared/transition-link";
import { Clock, Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPostMeta } from "@/lib/mdx";

interface BlogCardProps {
  post: BlogPostMeta;
  locale?: string;
}

export function BlogCard({ post, locale = "en" }: BlogCardProps) {
  return (
    <TransitionLink href={`/blog/${post.slug}`}>
      <Card className="group h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-snug">{post.title}</CardTitle>
            <ExternalLink
              className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-200 ease-out group-hover:text-foreground"
              aria-hidden="true"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {post.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.date).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </TransitionLink>
  );
}
