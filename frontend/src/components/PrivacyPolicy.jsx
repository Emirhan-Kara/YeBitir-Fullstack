import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Shield, Eye, Lock, FileCheck } from 'lucide-react';

const PrivacyPolicy = () => {
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
          <Shield size={64} style={{ color: theme.headerfooter.logoRed }} />
        </div>
        <h1 
          className="text-4xl font-bold mb-4"
          style={headingStyle}
        >
          Privacy Policy
        </h1>
        <p className="text-lg max-w-3xl mx-auto">
          At Ye-Bitir, we value your privacy and are committed to protecting your personal data.
          This Privacy Policy explains how we collect, use, and safeguard your information.
        </p>
        <p className="text-sm mt-4">Last Updated: March 7, 2025</p>
      </div>

      

      {/* Full Width Sections */}
      <div className="w-19/20 mx-auto space-y-8 mb-8">
        <div 
          className="rounded-[40px] p-8"
          style={sectionStyle}
        >
            <h2 className="text-2xl font-bold mb-4 text-center" style={headingStyle}>Your Rights and Choices</h2>
            <p className="mb-4 text-center">
                Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.core.containerHoover }}>
                <h3 className="font-bold mb-2">Access and Information</h3>
                <p className="text-sm">You can request a copy of your personal data and ask how it is being used.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.core.containerHoover }}>
                <h3 className="font-bold mb-2">Correction and Deletion</h3>
                <p className="text-sm">You can request correction of inaccurate data or deletion of your personal information.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.core.containerHoover }}>
                <h3 className="font-bold mb-2">Opt-Out Options</h3>
                <p className="text-sm">You can manage communication preferences and opt out of marketing communications.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Contact Section */}
      <div 
        className="w-19/20 mx-auto rounded-[40px] p-8 text-center mb-8"
        style={sectionStyle}
      >
        <h2 className="text-2xl font-bold mb-4" style={headingStyle}>Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <div className="inline-block p-8 rounded-lg" style={{ backgroundColor: theme.core.containerHoover }}>
          <p className="font-bold">Ye-Bitir Privacy Team</p>
          <p>Email: yebitir@gmail.com</p>
          <p>Phone: +90 500 000 00 01</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;