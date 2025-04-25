import * as React from "react"
import { Link } from "wouter"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbProps {
  segments: {
    name: string
    href: string
  }[]
  className?: string
}

export function Breadcrumb({ segments, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        "mx-auto flex w-full items-center space-x-2 overflow-auto whitespace-nowrap text-sm font-medium text-muted-foreground",
        className
      )}
      aria-label="Breadcrumb"
    >
      <Link href="/">
        <a className="flex items-center space-x-1 text-foreground hover:text-primary transition duration-300">
          <Home className="h-4 w-4" />
        </a>
      </Link>
      <ChevronRight className="h-4 w-4" />
      {segments.map((segment, index) => {
        const isLastItem = index === segments.length - 1
        return (
          <React.Fragment key={segment.href}>
            <li className={cn("list-none", isLastItem ? "text-foreground" : "text-muted-foreground")}>
              {isLastItem ? (
                <span className="font-semibold">{segment.name}</span>
              ) : (
                <Link href={segment.href}>
                  <a className="hover:text-primary transition duration-300">{segment.name}</a>
                </Link>
              )}
            </li>
            {!isLastItem && <ChevronRight className="h-4 w-4" />}
          </React.Fragment>
        )
      })}
    </nav>
  )
}