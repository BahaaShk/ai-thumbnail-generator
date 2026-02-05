import type React from "react";
import type { ThumbnailStyle } from "../assets/assets"
import { CpuIcon, ImageIcon, PenToolIcon, SquareIcon, SparkleIcon } from "lucide-react";

const StyleSelector = ({value, onChange, isOpen, setIsOpen} : {value: ThumbnailStyle; onChange:(style: ThumbnailStyle) => void;
  isOpen: boolean ; setIsOpen:(open: boolean) => void
}) => {

  const styleDescriptions: Record<ThumbnailStyle, string> = {
    "Bold & Graphic" : "High contrast, bold typography, striking visuals",
    "Minimalist" : "Clean, simple, lots of white space",
    "Photorealistic": "Photo-based, natural looking",
    "Illustrated":"Hand-drawn, artistic, creative",
    "Tech/Futuristic":"Modern, sleek, tech-inspired"
  }

  const styleIcons: Record<ThumbnailStyle, React.ReactNode> = {
    "Bold & Graphic" :<SparkleIcon className="h-4 w-4" />,
    "Minimalist" : <SquareIcon className="h-4 w-4" />,
    "Photorealistic": <ImageIcon className="h-4 w-4" />,
    "Illustrated":<PenToolIcon className="h-4 w-4" />,
    "Tech/Futuristic":<CpuIcon className="h-4 w-4" />
  }
  return (
    <div className=" relative space-y-3 dark">
      <label className=" block text-sm font-medium text-zinc-200">Thumbnail Style</label>
      <button>
        <div className=" space-y-1">
<div>{styleIcons[value]}</div>
        </div>
      </button>
    </div>
  )
}

export default StyleSelector