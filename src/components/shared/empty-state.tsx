import { type ReactNode } from "react";

type EmptyStateVariant = "first-use" | "no-results" | "error";

type EmptyStateProps = {
  variant: EmptyStateVariant;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
};

export function EmptyState({
  variant,
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-variant={variant}
    >
      {icon && <div className="mb-4 text-4xl">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
      {action &&
        (action.href ? (
          <a
            href={action.href}
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            type="button"
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}
