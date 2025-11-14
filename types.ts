
export interface Report {
  id: number;
  reportDate: string;
  reporterName: string;
  position: string;
  academicYear: string;
  dormitory: string;
  presentCount: number;
  sickCount: number;
  log: string;
  images?: File[];
}

export interface DormitoryStat {
  name: string;
  total: number;
  sick: number;
}
