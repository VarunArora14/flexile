"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ComboBox from "@/components/ComboBox";
import RangeInput from "@/components/RangeInput";
import { Label } from "@/components/ui/label";
import { useCurrentCompany, useCurrentUser } from "@/global";
import { trpc } from "@/trpc/client";
import Edit from "./Edit";
import { MAX_EQUITY_PERCENTAGE } from "@/models";

const AdminEdit = () => {
  const user = useCurrentUser();
  const company = useCurrentCompany();
  const searchParams = useSearchParams();
  const isAdminMode = searchParams.get("admin") === "true";
  
  if (!user.roles.administrator || !isAdminMode) {
    return <Edit />;
  }

  const [selectedContractor, setSelectedContractor] = useState<string>("");
  const [selectedEquityPercentage, setSelectedEquityPercentage] = useState<number>(0);
  const { data: contractors } = trpc.contractors.list.useQuery({
    companyId: company.id,
    excludeAlumni: true,
  });

  const contractorOptions =
    contractors?.map((contractor) => ({
      value: contractor.user.id,
      label: `${contractor.user.name} (${contractor.role || "No role"})`,
    })) || [];

  if (!selectedContractor) {
    return (
      <div className="mx-auto mt-8 max-w-md rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Create invoice for contractor</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="contractor-select">Select contractor</Label>
            <ComboBox
              id="contractor-select"
              value={selectedContractor}
              onChange={setSelectedContractor}
              options={contractorOptions}
              placeholder="Choose a contractor..."
            />
          </div>
          <button
            onClick={() => setSelectedContractor(selectedContractor)}
            disabled={!selectedContractor}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Continue to invoice form
          </button>
        </div>
      </div>
    );
  }

  if (!selectedEquityPercentage && company.equityCompensationEnabled) {
    return (
      <div className="mx-auto mt-8 max-w-md rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Set equity percentage</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="equity-percentage">Equity percentage</Label>
            <RangeInput
              id="equity-percentage"
              value={selectedEquityPercentage}
              onChange={setSelectedEquityPercentage}
              min={0}
              max={MAX_EQUITY_PERCENTAGE}
              aria-label="Equity percentage"
              unit="%"
            />
          </div>
          <button 
            onClick={() => setSelectedEquityPercentage(selectedEquityPercentage || 25)}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white"
          >
            Continue to invoice form
          </button>
        </div>
      </div>
    );
  }

  return <Edit contractorId={selectedContractor} isAdminMode={true} equityPercentage={selectedEquityPercentage} />;
};

export default AdminEdit;
