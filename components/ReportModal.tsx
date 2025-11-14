import React, { useState, useEffect } from 'react';
import { Report } from '../types';
import { ACADEMIC_YEARS, DORMITORIES, POSITIONS, GOOGLE_SCRIPT_URL } from '../constants';

interface ReportModalProps {
    onClose: () => void;
    onSave: (report: Report) => void;
    reportToEdit?: Report | null;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose, onSave, reportToEdit }) => {
    const [formData, setFormData] = useState({
        reporterName: '',
        position: POSITIONS[0],
        academicYear: (new Date().getFullYear() + 543).toString(),
        dormitory: DORMITORIES[0],
        presentCount: 0,
        sickCount: 0,
        log: '',
    });
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!reportToEdit;

    useEffect(() => {
        if (reportToEdit) {
            setFormData({
                reporterName: reportToEdit.reporterName,
                position: reportToEdit.position,
                academicYear: reportToEdit.academicYear,
                dormitory: reportToEdit.dormitory,
                presentCount: reportToEdit.presentCount,
                sickCount: reportToEdit.sickCount,
                log: reportToEdit.log,
            });
            setImages(reportToEdit.images || []);
        }
    }, [reportToEdit]);
    
    const isInfirmary = formData.dormitory === "เรือนพยาบาล";

    const getBuddhistDate = () => {
        const date = new Date();
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`;
    };

    useEffect(() => {
        const newImageUrls = images.map(file => URL.createObjectURL(file));
        setImagePreviews(newImageUrls);
        return () => newImageUrls.forEach(url => URL.revokeObjectURL(url));
    }, [images]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'presentCount' || name === 'sickCount' ? parseInt(value) || 0 : value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            if (images.length + filesArray.length > 10) {
                alert('คุณสามารถอัปโหลดได้ไม่เกิน 10 รูป');
                return;
            }
            setImages(prev => [...prev, ...filesArray]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };
    
    const fileToBase64 = (file: File): Promise<{ filename: string, mimeType: string, data: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                resolve({
                    filename: file.name,
                    mimeType: file.type,
                    data: result.split(',')[1] // remove data:mime/type;base64, part
                });
            };
            reader.onerror = error => reject(error);
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
             // We only convert new files to base64 for submission, not existing ones
             const newImageUploads = await Promise.all(
                images.filter(f => f instanceof File).map(fileToBase64)
             );
             
             const submissionData = {
                 ...formData,
                 reportDate: isEditing ? reportToEdit.reportDate : getBuddhistDate(),
                 // This part for Google Script might need adjustment depending on how it handles updates
                 images: newImageUploads, 
             };
             
             const response = await fetch(GOOGLE_SCRIPT_URL, {
                 method: 'POST',
                 mode: 'no-cors',
                 headers: {
                     'Content-Type': 'text/plain',
                 },
                 body: JSON.stringify(submissionData),
             });
             
             const savedReport: Report = {
                ...formData,
                id: isEditing ? reportToEdit.id : Date.now(),
                reportDate: isEditing ? reportToEdit.reportDate : getBuddhistDate(),
                images,
             };
             onSave(savedReport);
             onClose();

        } catch (err) {
            setError('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-navy">{isEditing ? 'แก้ไขข้อมูลรายงาน' : 'บันทึกข้อมูลรายงาน'}</h2>
                    <p className="text-secondary-gray">วันที่รายงาน: {isEditing ? reportToEdit.reportDate : getBuddhistDate()}</p>
                </div>
                <form id="report-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้รายงาน (ชื่อ-นามสกุล)</label>
                            <input type="text" name="reporterName" value={formData.reporterName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                            <select name="position" value={formData.position} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                            <select name="academicYear" value={formData.academicYear} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เรือนนอน</label>
                            <select name="dormitory" value={formData.dormitory} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                {DORMITORIES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนมาเรียน</label>
                            <input type="number" name="presentCount" value={isInfirmary ? 0 : formData.presentCount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isInfirmary} required={!isInfirmary}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ป่วย</label>
                            <input type="number" name="sickCount" value={formData.sickCount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">บันทึกเหตุการณ์ประจำวัน</label>
                        <textarea name="log" value={formData.log} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">อัปโหลดภาพ (ไม่เกิน 10 รูป)</label>
                        <input type="file" onChange={handleImageChange} multiple accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary-blue hover:file:bg-blue-100" />
                    </div>
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img src={preview} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-lg"/>
                                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                                </div>
                            ))}
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </form>
                <div className="p-6 border-t flex justify-end items-center space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                        ยกเลิก
                    </button>
                    <button type="submit" form="report-form" disabled={isLoading} className="bg-primary-blue hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'กำลังบันทึก...' : (isEditing ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลรายงาน')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;