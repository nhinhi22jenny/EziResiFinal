import React from "react";
import { Sidebar } from "@/components/Sidebar";
import Table from "@/components/RecommendationTable";

const Migrant: React.FC = () => {
  return (
    <div className="flex w-screen h-screen max-md:flex-col bg-primary md:items-end">
      <Sidebar />
      <div className="grow bg-secondary md:h-[98.5%] md:rounded-tl-xl p-5 overflow-auto">
        <div className="flex flex-col items-start justify-start">
          <h1 className="text-4xl font-bold text-primary">Recommendations</h1>
        </div>
        <div className="py-5">
          <Table />
        </div>
      </div>
    </div>
  );
};

export default Migrant;
