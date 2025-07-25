import React from "react";
import MarkdownRenderer from "@/src/components/markdownRenderer";

interface ServiceDescriptionProps {
  description?: string;
}

const SMPServiceLargeDescription: React.FC<ServiceDescriptionProps> = ({ description }) => {
  if (!description) {
    return (
      <div className="p-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        <p className="mb-0 text-center italic">Description non disponible</p>
      </div>
    );
  }

  return (
    <div className="description-container w-full">
      <MarkdownRenderer content={description} className="service-description" />
    </div>
  );
};

export default SMPServiceLargeDescription;
