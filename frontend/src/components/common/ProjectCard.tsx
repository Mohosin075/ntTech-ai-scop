import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import { ArrowRight, Clock } from 'lucide-react';

const cleanTitle = (title: string) =>
  title
    .replace(/^[\p{Extended_Pictographic}\s]+/u, '')
    .replace(/^(?:project|estimate)\s*[:—-]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const getDistinctSummary = (title: string, summary?: string) => {
  const clean = (summary || '')
    .replace(/^estimate\s+for\s+/i, '')
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/^(?:the|a|an)\s+/i, '')
    .trim();
  if (!clean) return 'Open the estimate to review its scope and delivery plan.';

  const titleWords = cleanTitle(title).toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const summaryWords = clean.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  let overlap = 0;
  while (overlap < titleWords.length && overlap < summaryWords.length && titleWords[overlap] === summaryWords[overlap]) {
    overlap += 1;
  }

  if (overlap >= 3) {
    const remaining = clean.split(/\s+/).slice(overlap).join(' ').replace(/^[\s:,.|—-]+/, '').trim();
    return remaining || 'Review the detailed scope, features, and delivery plan.';
  }

  return clean;
};

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const title = cleanTitle(project.title);
  const summary = getDistinctSummary(project.title, project.executiveSummary);

  return (
    <div
      className="rounded-2xl bg-white border border-[#d5deda] p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a9c1bb] hover:shadow-lg hover:shadow-[#173f52]/[0.06] group"
    >
      <div className="space-y-2.5">
        {/* Top Row: Title + Status Badge */}
        <div className="flex flex-col items-start gap-2">
          <h4 className="min-h-14 font-semibold text-lg text-[#182b39] transition-colors line-clamp-2">
            {title}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={project.status} />
            <StatusBadge risk={project.riskLevel} />
          </div>
        </div>

        {/* Middle: 1-line description */}
        <p className="text-[#526270] text-base line-clamp-1 leading-relaxed font-sans">
          {summary}
        </p>

        {/* Bottom Metrics: Flex in one line */}
        <div className="pt-3 border-t border-[#d5deda] flex items-center justify-between text-base">
          <div className="flex items-center gap-1.5">
            <span className="text-[#65717a] font-sans">Estimate:</span>
            <span className="text-[#182b39] font-medium">
              ${project.finalTotalCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#65717a] font-sans">Timeline:</span>
            <span className="text-[#304756] font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#65717a]" />
              {project.totalHours}h ({project.estimatedWeeks}w)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-[#d5deda]">
        <Link
          href={`/projects/${project.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-[#edf4f2] hover:bg-[#e2eeea] border border-[#d5e2dd] hover:border-[#a9c1bb] text-base font-semibold text-[#173f52] transition-colors"
        >
          <span>View estimate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
