interface ExtractSermonTitleOptions {
  summary: string;
  defaultTitle?: string;
}

export const extractSermonTitle = ({
  summary,
  defaultTitle = '마음판에 새긴 설교',
}: ExtractSermonTitleOptions): string => {
  return summary.split('\n')[0]?.replace(/^#*\s*/, '') || defaultTitle;
};
