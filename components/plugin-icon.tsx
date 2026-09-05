import {
  Scan,
  AudioLines,
  Search,
  Network,
  BrainCircuit,
  Clapperboard,
  Box,
  Ruler,
  GraduationCap,
  Monitor,
} from 'lucide-react';

const icons = {
  scan: Scan,
  waves: AudioLines,
  search: Search,
  network: Network,
  brain: BrainCircuit,
  film: Clapperboard,
  box: Box,
  ruler: Ruler,
  graduation: GraduationCap,
  monitor: Monitor,
};
export function PluginIcon({
  icon,
  color,
  large = false,
}: {
  icon: string;
  color: string;
  large?: boolean;
}) {
  const Icon = icons[icon as keyof typeof icons] || Box;
  return (
    <span className={`plugin-icon ${color}${large ? ' large' : ''}`}>
      <Icon size={large ? 30 : 23} strokeWidth={1.6} />
    </span>
  );
}
