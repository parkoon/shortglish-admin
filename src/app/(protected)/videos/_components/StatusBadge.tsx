type StatusBadgeProps = {
  status: "draft" | "published";
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "published") {
    return (
      <div className="flex items-center gap-2">
        <div className="relative h-4 w-4">
          <div className="absolute inset-0 rounded-full bg-green-300 opacity-60"></div>
          <div className="relative h-3 w-3 rounded-full bg-green-600 m-0.5"></div>
        </div>
        <span className="text-sm font-medium text-green-700">PUBLISHED</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-4 w-4">
        <div className="absolute inset-0 rounded-full bg-gray-300 opacity-60"></div>
        <div className="relative h-3 w-3 rounded-full bg-gray-500 m-0.5"></div>
      </div>
      <span className="text-sm font-medium text-gray-700">DRAFT</span>
    </div>
  );
}

