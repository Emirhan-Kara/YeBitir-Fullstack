import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FileText, Database, UserCheck, Scale } from 'lucide-react';

const KVKKCompliance = () => {
  const { theme } = useTheme();

  // Common section style
  const sectionStyle = {
    backgroundColor: theme.core.container,
    color: theme.core.text
  };

  // Heading style
  const headingStyle = {
    color: theme.headerfooter.logoRed
  };

  return (
    <div 
      className="min-h-screen w-full py-6 px-4"
      style={{ backgroundColor: theme.core.background, color: theme.core.text }}
    >
      {/* Hero Section */}
      <div 
        className="w-19/20 mx-auto rounded-[40px] p-10 mb-8 text-center"
        style={sectionStyle}
      >
        <div className="flex justify-center mb-4">
          <Scale size={64} style={{ color: theme.headerfooter.logoRed }} />
        </div>
        <h1 
          className="text-4xl font-bold mb-4"
          style={headingStyle}
        >
          KVKK Compliance
        </h1>
        <p className="text-lg max-w-3xl mx-auto">
          In accordance with Turkey's Personal Data Protection Law (KVKK), we have implemented comprehensive measures 
          to ensure the proper collection, processing, and protection of your personal data.
        </p>
        <p className="text-sm mt-4">Last Updated: March 7, 2025</p>
      </div>


      {/* Full Width Sections */}
      <div className="w-19/20 mx-auto space-y-8 mb-8">
        <div 
          className="rounded-[40px] p-8"
          style={sectionStyle}
        >
          <div className="flex items-center justify-center mb-4">
            <UserCheck size={32} style={{ color: theme.headerfooter.logoRed }} className="mr-4" />
            <h2 className="text-2xl font-bold" style={headingStyle}>Your KVKK Rights</h2>
          </div>
          <p className="mb-4 text-center">
            Under KVKK, you have the following rights regarding your personal data:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.headerfooter.background }}>
              <h3 className="font-bold mb-2">Right to Information</h3>
              <p className="text-sm">You have the right to know if your personal data is being processed, and if so, to request information about the processing activities.</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.headerfooter.background }}>
              <h3 className="font-bold mb-2">Right to Correction</h3>
              <p className="text-sm">You have the right to request correction of incomplete or inaccurate personal data.</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.headerfooter.background }}>
              <h3 className="font-bold mb-2">Right to Deletion</h3>
              <p className="text-sm">You have the right to request deletion of your personal data under certain conditions specified in KVKK.</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.headerfooter.background }}>
              <h3 className="font-bold mb-2">Right to Object</h3>
              <p className="text-sm">You have the right to object to processing of your data in certain circumstances, including for direct marketing purposes.</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.headerfooter.background }}>
              <h3 className="font-bold mb-2">Right to Data Portability</h3>
              <p className="text-sm">You have the right to receive your personal data in a structured, machine-readable format.</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: theme.headerfooter.background }}>
              <h3 className="font-bold mb-2">Right to Complain</h3>
              <p className="text-sm">You have the right to lodge a complaint with the Turkish Data Protection Authority (KVKK).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KVKKCompliance;