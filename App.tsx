import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import ReportModal from './components/ReportModal';
import ViewReportModal from './components/ViewReportModal';
import { Report } from './types';

// Mock data for initial display
const MOCK_REPORTS: Report[] = [
    { id: 1, reportDate: '15/07/2567', reporterName: 'นันทพัทธ์ แสงสุดตา', position: 'ครู', academicYear: '2567', dormitory: 'ภูไท', presentCount: 48, sickCount: 2, log: 'นักเรียนปกติ', images: [] },
    { id: 2, reportDate: '15/07/2567', reporterName: 'สมชาย ใจดี', position: 'ครูผู้ช่วย', academicYear: '2567', dormitory: 'แพรวา', presentCount: 50, sickCount: 0, log: 'เรียบร้อยดี', images: [] },
    { id: 3, reportDate: '14/07/2567', reporterName: 'นันทพัทธ์ แสงสุดตา', position: 'ครู', academicYear: '2567', dormitory: 'ภูไท', presentCount: 49, sickCount: 1, log: 'นักเรียน 1 คน มีไข้', images: [] },
    { id: 4, reportDate: '15/07/2567', reporterName: 'สมหญิง จริงใจ', position: 'ครูชำนาญการ', academicYear: '2567', dormitory: 'ฟ้าแดด', presentCount: 52, sickCount: 1, log: 'นักเรียนไปโรงพยาบาล 1 คน', images: [] },
    { id: 5, reportDate: '15/07/2567', reporterName: 'กิตติ มานะ', position: 'ครู', academicYear: '2567', dormitory: 'เรือนพยาบาล', presentCount: 0, sickCount: 5, log: 'รับนักเรียนป่วย 5 คน', images: [] },
];

const App: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
    const [viewingReport, setViewingReport] = useState<Report | null>(null);
    const [editingReport, setEditingReport] = useState<Report | null>(null);

    const handleOpenModal = () => {
      setEditingReport(null);
      setIsModalOpen(true);
    };
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingReport(null);
    };
    
    const handleViewReport = (report: Report) => setViewingReport(report);
    const handleCloseViewModal = () => setViewingReport(null);
    
    const handleEditReport = (report: Report) => {
        setEditingReport(report);
        setIsModalOpen(true);
    };

    const handleSaveReport = (report: Report) => {
        if (editingReport) { // Update existing
            setReports(prevReports => prevReports.map(r => r.id === report.id ? report : r));
        } else { // Add new
            setReports(prevReports => [{ ...report, id: Date.now() }, ...prevReports]);
        }
    };

    const deleteReports = (ids: number[]) => {
      setReports(prev => prev.filter(r => !ids.includes(r.id)));
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header onReportClick={handleOpenModal} />
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
                <Dashboard 
                    reports={reports} 
                    setReports={setReports} 
                    deleteReports={deleteReports}
                    onViewReport={handleViewReport}
                    onEditReport={handleEditReport}
                />
            </main>
            <Footer />
            {isModalOpen && (
                <ReportModal 
                    onClose={handleCloseModal} 
                    onSave={handleSaveReport}
                    reportToEdit={editingReport}
                />
            )}
            {viewingReport && (
                <ViewReportModal 
                    report={viewingReport}
                    onClose={handleCloseViewModal}
                />
            )}
        </div>
    );
};

export default App;