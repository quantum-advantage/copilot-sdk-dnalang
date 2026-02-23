"use client"

import { Badge } from "@/components/ui/badge"
import { useCRSMOptional } from "@/components/11dcrsm-provider"
import { Activity, Shield, AlertTriangle, CheckCircle2 } from "lucide-react"

interface CRSMMetricsBarProps {
  compact?: boolean
  showStatus?: boolean
}

export function CRSMMetricsBar({ compact = false, showStatus = true }: CRSMMetricsBarProps) {
  const crsm = useCRSMOptional()
  
  if (!crsm) {
    return null
  }
  
  const { lambda, phi, gamma, xi, systemStatus, constants } = crsm
  const { GAMMA_BASELINE } = constants
  
  const statusColors = {
    nominal: "text-emerald-500",
    warning: "text-amber-500",
    critical: "text-red-500"
  }
  
  const statusBg = {
    nominal: "bg-emerald-500/10",
    warning: "bg-amber-500/10",
    critical: "bg-red-500/10"
  }
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-muted-foreground">
          Λ: <span className="text-primary">{lambda.toFixed(2)}</span>
        </span>
        <span className="text-muted-foreground">
          Γ: <span className={gamma > GAMMA_BASELINE * 1.5 ? "text-destructive" : "text-accent"}>
            {gamma.toFixed(3)}
          </span>
        </span>
        {showStatus && (
          <div className={`h-2 w-2 rounded-full ${statusColors[systemStatus]} animate-pulse`} />
        )}
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="text-muted-foreground">
          Λ: <span className="text-primary">{lambda.toFixed(3)}</span>
        </span>
        <span className="text-muted-foreground">
          Φ: <span className="text-secondary">{phi.toExponential(2)}</span>
        </span>
        <span className="text-muted-foreground">
          Γ: <span className={gamma > GAMMA_BASELINE * 1.5 ? "text-destructive" : "text-accent"}>
            {gamma.toFixed(4)}
          </span>
        </span>
        <span className="text-muted-foreground">
          Ξ: <span className="text-chart-4">{xi.toFixed(2)}</span>
        </span>
      </div>
      
      {showStatus && (
        <Badge 
          variant="outline" 
          className={`${statusBg[systemStatus]} ${statusColors[systemStatus]} border-current`}
        >
          {systemStatus === "nominal" && <CheckCircle2 className="h-3 w-3 mr-1" />}
          {systemStatus === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
          {systemStatus === "critical" && <Shield className="h-3 w-3 mr-1" />}
          {systemStatus.toUpperCase()}
        </Badge>
      )}
    </div>
  )
}
