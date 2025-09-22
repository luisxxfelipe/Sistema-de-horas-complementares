"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

type ChartContextValue = {
  config: Record<string, { label: string; color: string }>
}

const ChartContext = React.createContext<ChartContextValue | undefined>(
  undefined
)

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: Record<string, { label: string; color: string }>
}

function ChartContainer({
  children,
  config,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn("h-80 w-full", className)}
        {...props}
        style={{
          ...Object.fromEntries(
            Object.entries(config).map(([key, value]) => [
              `--color-${key}`,
              value.color,
            ])
          ),
        }}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

interface ChartTooltipProps extends React.ComponentProps<"div"> {}

function ChartTooltip({ className, ...props }: ChartTooltipProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2 shadow-md",
        className
      )}
      {...props}
    />
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    dataKey: string
    payload: Record<string, any>
  }>
  label?: string
}

function ChartTooltipContent({
  active,
  payload,
  label,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="grid gap-2">
        {label && <div className="font-medium">{label}</div>}
        <div className="grid gap-1">
          {payload.map((data, i) => {
            const configKey = data.dataKey
            const color = config[configKey]?.color
            const name = config[configKey]?.label || data.name
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-muted-foreground">
                  {name}: {data.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChart }
