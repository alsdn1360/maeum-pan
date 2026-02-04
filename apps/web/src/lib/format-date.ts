interface FormatDateOptions {
  dateString: string;
}

export const formatDate = ({ dateString }: FormatDateOptions) => {
  try {
    return new Date(dateString).toLocaleDateString('ko-KR');
  } catch {
    return '날짜 미상';
  }
};
