import { Sidebar } from "@/components/Sidebar";
import React from "react";

const Users: React.FC = () => {
  return (
    <div className="h-screen flex max-md:flex-col w-screen bg-primary md:items-end">
      <Sidebar />
      <div className="grow bg-secondary md:h-[98.5%] md:rounded-tl-xl">
        {/* Contents here */}
      </div>
    </div>
  );
};

export default Users;
