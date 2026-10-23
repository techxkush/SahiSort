import React from 'react';
import { ReuseProject } from '../types';
import { Clock, ShieldAlert, ArrowRight, Wrench, Package, Check, Sparkles } from 'lucide-react';

interface ProjectCardProps {
  project: ReuseProject;
  onSelectProject: (project: ReuseProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject }) => {
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Advanced':
      default:
        return 'bg-orange-100 text-orange-900 border-orange-300';
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-7 flex flex-col justify-between group">
      <div className="space-y-4">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getDifficultyBadge(project.difficulty)}`}>
            {project.difficulty}
          </span>
          <div className="flex items-center space-x-1.5 text-xs text-earth-muted font-medium">
            <Clock className="w-3.5 h-3.5 text-forest-700" />
            <span>{project.estimatedTime}</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h4 className="font-editorial text-2xl font-semibold text-forest-950 group-hover:text-forest-800 transition-colors">
            {project.title}
          </h4>
          <p className="text-xs sm:text-sm text-forest-800/80 mt-1.5 leading-relaxed">
            {project.subtitle}
          </p>
        </div>

        {/* You'll Need (Materials preview) */}
        <div className="bg-cream-100/70 rounded-2xl p-4 border border-cream-200/80 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-earth-muted flex items-center space-x-1.5">
            <Package className="w-3.5 h-3.5 text-forest-700" />
            <span>You'll Need</span>
          </span>
          <ul className="text-xs text-forest-900 space-y-1">
            {project.materials.slice(0, 3).map((mat, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600 flex-shrink-0" />
                <span className="truncate">{mat}</span>
              </li>
            ))}
            {project.materials.length > 3 && (
              <li className="text-[11px] text-earth-muted font-medium pl-3.5">
                +{project.materials.length - 3} more items
              </li>
            )}
          </ul>
        </div>

        {/* Tools preview */}
        <div className="flex items-center space-x-2 text-xs text-earth-muted">
          <Wrench className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
          <span className="font-medium text-forest-900">Tools:</span>
          <span className="truncate">{project.tools.join(', ')}</span>
        </div>

        {/* Safety Note */}
        {project.safetyNotes && (
          <div className="text-[11px] text-earth-muted flex items-start space-x-1.5 bg-cream-50 p-2.5 rounded-xl border border-cream-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{project.safetyNotes}</span>
          </div>
        )}

      </div>

      {/* Button CTA */}
      <div className="pt-5 mt-4 border-t border-cream-200">
        <button
          onClick={() => onSelectProject(project)}
          className="w-full flex items-center justify-center space-x-2 bg-cream-200 hover:bg-forest-800 hover:text-white text-forest-950 py-3 rounded-xl text-sm font-semibold transition-all group-hover:bg-forest-800 group-hover:text-white"
        >
          <span>View Project</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
