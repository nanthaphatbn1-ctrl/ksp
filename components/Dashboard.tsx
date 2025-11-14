import React, { useState, useMemo } from 'react';
import { Report } from '../types';
import StatsCard from './StatsCard';
import ReportChart from './ReportChart';
import ReportTable from './ReportTable';
import { DORMITORIES } from '../constants';

interface DashboardProps {
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
    deleteReports: (ids: number[]) => void;
    onViewReport: (report: Report) => void;
    onEditReport: (report: Report) => void;
}

type TimeView = 'Latest' | 'Daily' | 'Monthly' | 'Yearly';

const parseThaiDate = (dateString: string): Date => {
    const parts = dateString.split('/');
    if (parts.length !== 3) return new Date(0); // Return an invalid date for comparison
    const [day, month, year] = parts.map(Number);
    const gregorianYear = year - 543;
    return new Date(gregorianYear, month - 1, day);
};

const Dashboard: React.FC<DashboardProps> = ({ reports, setReports, deleteReports, onViewReport, onEditReport }) => {
    const [timeView, setTimeView] = useState<TimeView>('Latest');

    const { dormitoryData, totalStudents, totalSick, titleSuffix } = useMemo(() => {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let filteredReports: Report[] = [];
        let titleSuffix = '(ล่าสุด)';

        if (timeView === 'Latest') {
            const latestReportsMap = new Map<string, Report>();
            reports.forEach(report => {
                const existingReport = latestReportsMap.get(report.dormitory);
                if (!existingReport || parseThaiDate(report.reportDate) > parseThaiDate(existingReport.reportDate)) {
                    latestReportsMap.set(report.dormitory, report);
                }
            });
            filteredReports = Array.from(latestReportsMap.values());
        } else {
             let filterFn: (report: Report) => boolean;
             switch (timeView) {
                case 'Daily':
                    titleSuffix = '(รายวัน)';
                    filterFn = r => {
                        const d = parseThaiDate(r.reportDate);
                        return d.getDate() === currentDay && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    };
                    break;
                case 'Monthly':
                    titleSuffix = '(รายเดือน)';
                     filterFn = r => {
                        const d = parseThaiDate(r.reportDate);
                        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    };
                    break;
                case 'Yearly':
                    titleSuffix = '(รายปี)';
                     filterFn = r => {
                        const d = parseThaiDate(r.reportDate);
                        return d.getFullYear() === currentYear;
                    };
                    break;
                default:
                    filterFn = () => true;
             }
             filteredReports = reports.filter(filterFn);
        }
        
        const aggregatedByDorm = filteredReports.reduce((acc, report) => {
            if (report.dormitory === 'เรือนพยาบาล') {
                if(!acc['เรือนพยาบาล']) acc['เรือนพยาบาล'] = { presentCount: 0, sickCount: 0 };
                acc['เรือนพยาบาล'].sickCount += report.sickCount;
                return acc;
            }

            if (!acc[report.dormitory]) {
                acc[report.dormitory] = { presentCount: 0, sickCount: 0 };
            }
            acc[report.dormitory].presentCount += report.presentCount;
            acc[report.dormitory].sickCount += report.sickCount;
            return acc;
        }, {} as Record<string, { presentCount: number, sickCount: number }>);


        const finalDormitoryData = DORMITORIES.filter(d => d !== "เรือนพยาบาล").map(dormName => {
            const stats = aggregatedByDorm[dormName];
            return {
                name: dormName,
                total: stats ? stats.presentCount + stats.sickCount : 0,
                sick: stats ? stats.sickCount : 0,
            };
        });

        const finalTotalStudents = Object.values(aggregatedByDorm).reduce((sum, dorm) => sum + (dorm.presentCount || 0), 0);
        const finalTotalSick = Object.values(aggregatedByDorm).reduce((sum, dorm) => sum + (dorm.sickCount || 0), 0);

        return {
            dormitoryData: finalDormitoryData,
            totalStudents: finalTotalStudents,
            totalSick: finalTotalSick,
            titleSuffix,
        };

    }, [reports, timeView]);
    
    const viewButtons: { key: TimeView; label: string }[] = [
        { key: 'Latest', label: 'ล่าสุด' },
        { key: 'Daily', label: 'รายวัน' },
        { key: 'Monthly', label: 'รายเดือน' },
        { key: 'Yearly', label: 'รายปี' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title={`นักเรียนมาทั้งหมด ${titleSuffix}`} value={totalStudents.toString()} />
                <StatsCard title={`นักเรียนป่วย ${titleSuffix}`} value={totalSick.toString()} />
                <StatsCard title="เรือนนอนทั้งหมด" value={(DORMITORIES.length - 1).toString()} />
                <StatsCard title="จำนวนรายงานทั้งหมด" value={reports.length.toString()} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                     <h2 className="text-xl font-bold text-navy mb-2 sm:mb-0">ภาพรวมนักเรียนแต่ละเรือนนอน {titleSuffix}</h2>
                     <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                         {viewButtons.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setTimeView(key)}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                                    timeView === key
                                    ? 'bg-primary-blue text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {label}
                            </button>
                         ))}
                    </div>
                </div>
                <ReportChart data={dormitoryData} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-navy mb-4">ข้อมูลการรายงาน</h2>
                <ReportTable reports={reports} deleteReports={deleteReports} onViewReport={onViewReport} onEditReport={onEditReport} />
            </div>
        </div>
    );
};

export default Dashboard;