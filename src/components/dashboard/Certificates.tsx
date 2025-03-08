import React from 'react';
import { Certificate } from './types';

interface CertificatesProps {
  certificates: Certificate[];
}

export const Certificates: React.FC<CertificatesProps> = ({ certificates }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Sertifikalar</h2>
      <div className="flex justify-center mb-8">
        <div className="flex space-x-6 max-w-[1200px] overflow-x-auto pb-4">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="certificate-card w-72 flex-shrink-0">
              <div className="relative pt-[60%]">
                <img 
                  src={certificate.image} 
                  alt={certificate.title} 
                  className="absolute inset-0 w-full h-full object-contain p-4" 
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{certificate.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{certificate.description}</p>
                <div className="mt-4">
                  <span className="text-sm font-medium text-green-600">%{certificate.progress} Tamamlandı</span>
                  <div className="progress-bar mt-2">
                    <div style={{ width: `${certificate.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 