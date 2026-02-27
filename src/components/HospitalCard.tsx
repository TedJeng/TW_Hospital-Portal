import { MapPin, Phone, ExternalLink, Tag } from "lucide-react";
import type { Hospital } from "@/types";

interface HospitalCardProps {
  hospital: Hospital;
}

const HospitalCard = ({ hospital }: HospitalCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-800 leading-tight">
          {hospital.name}
        </h2>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          <Tag size={10} />
          {hospital.city}
        </span>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 text-sm text-gray-500">
        <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
        <span>
          {hospital.district}・{hospital.address}
        </span>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Phone size={15} className="shrink-0 text-gray-400" />
        <a
          href={`tel:${hospital.phone}`}
          className="hover:text-blue-600 transition-colors"
        >
          {hospital.phone}
        </a>
      </div>

      {/* Services */}
      <div className="flex flex-wrap gap-1.5">
        {hospital.services.map((service) => (
          <span
            key={service}
            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
          >
            {service}
          </span>
        ))}
      </div>

      {/* CTA */}
      {hospital.website ? (
        <a
          href={hospital.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:scale-95 transition-all duration-150"
        >
          前往官方網站
          <ExternalLink size={14} />
        </a>
      ) : (
        <div className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed">
          官方網站未提供
        </div>
      )}
    </div>
  );
};

export default HospitalCard;
