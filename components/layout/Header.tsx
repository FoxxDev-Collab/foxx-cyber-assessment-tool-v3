"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: "Assessment", href: "/assessment" },
  { name: "Results", href: "/results" },
  { name: "Export", href: "/export" },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-none">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight">Foxx Cyber Assessment Tool</span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors hover:text-foreground/80",
                  pathname === item.href
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Desktop ThemeToggle */}
          <div className="hidden md:flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2 bg-card border-t">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block py-2 px-3 text-base font-medium rounded-md",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:bg-accent/50 hover:text-accent-foreground"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}