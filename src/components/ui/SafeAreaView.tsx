import React from "react";

interface SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
}

const SafeAreaView = ({ children, className = "" }: SafeAreaViewProps) => {
  return (
    <div
      className={`flex-1 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] ${className}`}
    >
      {children}
    </div>
  );
};

export default SafeAreaView;
