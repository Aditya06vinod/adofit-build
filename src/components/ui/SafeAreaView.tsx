import React from "react";

interface SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
}

const SafeAreaView = ({ children, className = "" }: SafeAreaViewProps) => {
  return (
    <div
      className={`flex-1 flex flex-col ${className}`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {children}
    </div>
  );
};

export default SafeAreaView;
