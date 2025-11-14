import React from 'react';

interface HeaderProps {
    onReportClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReportClick }) => {
    return (
        <header className="bg-gradient-to-r from-primary-blue to-blue-700 text-white shadow-lg sticky top-0 z-20">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <img 
                        src="https://img5.pic.in.th/file/secure-sv1/-15bb7f54b4639a903.png" 
                        alt="School Logo" 
                        className="h-12 w-12 object-contain bg-white p-1 rounded-full"
                    />
                    <h1 className="text-lg md:text-xl font-bold hidden sm:block">
                        สถิติจำนวนนักเรียนทั้งหมด แยกประเภทตามเรือนนอน
                    </h1>
                </div>
                <button
                    onClick={onReportClick}
                    className="bg-white text-primary-blue hover:bg-blue-50 font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                >
                    <span className="hidden sm:inline">เพิ่มรายงาน</span>
                    <span className="sm:hidden">+</span>
                </button>
            </div>
        </header>
    );
};

export default Header;