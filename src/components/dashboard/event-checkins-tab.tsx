type CheckinStats = {
  total: number;
  scanned: number;
};

type EventCheckinsTabProps = {
  stats: CheckinStats;
};

export function EventCheckinsTab({ stats }: EventCheckinsTabProps) {
  const percentage = stats.total > 0 ? Math.round((stats.scanned / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Total entradas</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Check-ins</p>
          <p className="text-2xl font-bold">{stats.scanned}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Asistencia</p>
          <p className="text-2xl font-bold">{percentage}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1 flex justify-between text-sm text-gray-500">
          <span>Progreso de check-in</span>
          <span>
            {stats.scanned} / {stats.total}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
