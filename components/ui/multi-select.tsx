"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Badge } from "./badge"
import { Button } from "./button"
import { Input } from "./input"

interface MultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  maxSelected?: number
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  className,
  disabled = false,
  maxSelected,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      if (maxSelected && selected.length >= maxSelected) {
        return
      }
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={cn("w-full relative", className)} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between min-h-[40px] h-auto p-2 border-2 border-neutral-200 hover:border-neutral-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selected.length === 0 ? (
            <span className="text-neutral-400">{placeholder}</span>
          ) : (
            selected.map((value) => {
              const option = options.find((opt) => opt.value === value)
              return (
                <Badge
                  key={value}
                  variant="secondary"
                  className="mr-1 mb-1 bg-primary-100 text-primary-700 hover:bg-primary-200"
                >
                  {option?.label || value}
                  <button
                    type="button"
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRemove(value)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(value)
                    }}
                  >
                    <X className="h-3 w-3 text-primary-600 hover:text-primary-800" />
                  </button>
                </Badge>
              )
            })
          )}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-neutral-200">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-neutral-500">
                No results found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-neutral-50 text-sm"
                  onClick={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100 text-primary-600"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}