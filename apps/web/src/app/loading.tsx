import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center">
      <Spinner className="text-muted-foreground size-6" />
    </div>
  );
}
