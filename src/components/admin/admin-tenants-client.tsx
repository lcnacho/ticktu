"use client";

import Link from "next/link";
import type { Producer } from "@/lib/db/schema/producers";
import { formatDateTime } from "@/lib/utils/dates";

type Props = {
  producers: Producer[];
};

export function AdminTenantsClient({ producers }: Props) {
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Link
          href="/tenants/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Nueva Productora
        </Link>
      </div>

      {producers.length === 0 ? (
        <p className="text-sm text-gray-500">No hay productoras registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Nombre</th>
                <th className="pb-2 pr-4 font-medium">Slug</th>
                <th className="pb-2 pr-4 font-medium">Moneda</th>
                <th className="pb-2 pr-4 font-medium">Estado</th>
                <th className="pb-2 font-medium">Creada</th>
              </tr>
            </thead>
            <tbody>
              {producers.map((producer) => (
                <tr key={producer.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium">{producer.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{producer.slug}</td>
                  <td className="py-2 pr-4 text-gray-500">{producer.currency}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        producer.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {producer.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500">
                    {formatDateTime(new Date(producer.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
