export interface Hospital {
  id: string;
  name: string;
  city: City;
  district: string;
  address: string;
  phone: string;
  website: string;
  logoUrl?: string;
  services: string[];
}

export type City =
  | "台北市"
  | "新北市"
  | "桃園市"
  | "台中市"
  | "台南市"
  | "高雄市"
  | "基隆市"
  | "新竹市"
  | "嘉義市"
  | "苗栗縣"
  | "彰化縣"
  | "南投縣"
  | "雲林縣"
  | "屏東縣"
  | "宜蘭縣"
  | "花蓮縣"
  | "台東縣"
  | "澎湖縣"
  | "金門縣"
  | "連江縣";

export interface HospitalSearchParams {
  city?: string;
  q?: string;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
}
