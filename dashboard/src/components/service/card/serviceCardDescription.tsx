// SMPServiceCardDescription.tsx
const SMPServiceCardDescription = ({ title, description }: { title: string; description: string }) => {
    return (
      <div className="mt-2">
        <h3 className="text-lg font-semibold leading-6 text-gray-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {description.length > 120 ? `${description.substring(0, 120)}...` : description}
        </p>
      </div>
    );
  };
  
  export default SMPServiceCardDescription;
  