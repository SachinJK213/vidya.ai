import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

interface InfoTipProps {
  text: string
}

export function InfoTip({ text }: InfoTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none"
          tabIndex={-1}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}
