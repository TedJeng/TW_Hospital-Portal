import { MapPin, Phone, ExternalLink, Tag, Heart, CalendarDays } from "lucide-react";
import type { Hospital } from "@/types";

interface HospitalCardProps {
  hospital: Hospital;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const HospitalCard = ({
  hospital,
  isFavorite = false,
  onToggleFavorite,
}: HospitalCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-800 leading-tight">
          {hospital.name}
        </h2>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            <Tag size={10} />
            {hospital.city}
          </span>
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              aria-label={isFavorite ? "取消常用" : "加入常用"}
              className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Heart
                size={18}
                className={
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-300 hover:text-red-400 transition-colors"
                }
              />
            </button>
          )}
        </div>
      </div>

      {/* Address */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-2 text-sm text-gray-500 hover:text-blue-600 group transition-colors"
      >
        <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors" />
        <span className="group-hover:underline underline-offset-2">
          {hospital.district}・{hospital.address}
        </span>
      </a>

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
      <div className="mt-auto flex flex-col gap-2">
        {hospital.appointmentUrl && (
          <a
            href={hospital.appointmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 active:scale-95 transition-all duration-150"
          >
            <CalendarDays size={14} />
            網路掛號
          </a>
        )}
        {hospital.website ? (
          <a
            href={hospital.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:scale-95 transition-all duration-150"
          >
            前往官方網站
            <ExternalLink size={14} />
          </a>
        ) : (
          !hospital.appointmentUrl && (
            <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed">
              官方網站未提供
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HospitalCard;
