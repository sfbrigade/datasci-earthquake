"use client";

import { useParams } from "next/navigation";

const BuildingDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Building Details for ID: {id}</h1>
    </div>
  );
};

export default BuildingDetails;
