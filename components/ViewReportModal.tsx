import React, { useState, useMemo, useEffect } from 'react';
import { Report } from '../types';

interface ViewReportModalProps {
    report: Report;
    onClose: () => void;
}

const ViewReportModal: React.FC<ViewReportModalProps> = ({ report, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const imagePreviews = useMemo(() => {
        return report.images?.map(file => URL.createObjectURL(file)) || [];
    }, [report.images]);

    useEffect(() => {
        // Cleanup object URLs on unmount to prevent memory leaks
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const goToNextImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % imagePreviews.length);
    };

    const goToPreviousImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex - 1 + imagePreviews.length) % imagePreviews.length);
    };

    const DetailItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
        <div>
            <p className="text-sm font-medium text-secondary-gray">{label}</p>
            <p className="text-md font-semibold text-navy">{value}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-40 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-navy">รายละเอียดรายงาน</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Details Section */}
                    <div className="space-y-4">
                        <DetailItem label="วันที่รายงาน" value={report.reportDate} />
                        <DetailItem label="ชื่อผู้รายงาน" value={report.reporterName} />
                        <DetailItem label="ตำแหน่ง" value={report.position} />
                        <DetailItem label="ปีการศึกษา" value={report.academicYear} />
                        <DetailItem label="เรือนนอน" value={report.dormitory} />
                         {report.dormitory !== 'เรือนพยาบาล' && <DetailItem label="จำนวนมาเรียน" value={report.presentCount} />}
                        <DetailItem label="จำนวนป่วย" value={report.sickCount} />
                        <div>
                           <p className="text-sm font-medium text-secondary-gray">บันทึกเหตุการณ์</p>
                           <p className="text-md font-semibold text-navy bg-light-gray p-3 rounded-lg mt-1 break-words">{report.log || 'ไม่มี'}</p>
                        </div>
                    </div>

                    {/* Image Slideshow Section */}
                    <div>
                        <h3 className="text-lg font-bold text-navy mb-2">รูปภาพประกอบ</h3>
                        {imagePreviews.length > 0 ? (
                            <div className="relative">
                                <img 
                                    src={imagePreviews[currentImageIndex]} 
                                    alt={`report image ${currentImageIndex + 1}`}
                                    className="w-full h-80 object-cover rounded-lg shadow-md bg-gray-200" 
                                />
                                {imagePreviews.length > 1 && (
                                    <>
                                        <button onClick={goToPreviousImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity">
                                            &#10094;
                                        </button>
                                        <button onClick={goToNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity">
                                            &#10095;
                                        </button>
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full">
                                            {currentImageIndex + 1} / {imagePreviews.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-80 bg-light-gray rounded-lg">
                                <p className="text-secondary-gray">ไม่มีรูปภาพประกอบ</p>
                            </div>
                        )}
                    </div>
                </div>

                 <div className="p-4 border-t bg-light-gray rounded-b-xl flex justify-end">
                    <button type="button" onClick={onClose} className="bg-primary-blue hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg">
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewReportModal;