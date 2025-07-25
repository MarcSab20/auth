"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDashboardContext } from "@/context/dashboardContext";
import { Button } from "@/src/components/landing-page/Button";
import { Heading } from "@/src/components/catalyst/components/heading";

const contractTypes = ["consulting", "subcontracting", "employment"];

/* ——— Types ——— */
interface Estimate {
  estimateId: string;
  title: string;
  clientName: string;
  total: number;
}

interface ContractDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  organizationID: string;
}

export default function ContractDrawer({
  isOpen,
  onClose,
  organizationID,
}: ContractDrawerProps) {
  const router = useRouter();
  const { organizationNav } = useDashboardContext();
  const org = organizationNav.find((o) => o.organizationID === organizationID);

  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [estimateId, setEstimateId] = useState("");
  const [contractType, setContractType] = useState("consulting");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState(12);
  const [renewable, setRenewable] = useState(true);
  const [renewDur, setRenewDur] = useState(12);
  const [notice, setNotice] = useState(30);
  const [jurisdiction, setJurisdiction] = useState("Paris");

  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/organizations/${organizationID}/estimates`)
      .then((r) => r.json())
      .then(setEstimates)
      .catch(console.error);
  }, [isOpen, organizationID]);

  const create = async () => {
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationID,
        estimateId,
        contractType,
        startDate,
        duration,
        renewable,
        renewDuration: renewDur,
        renewNotice: notice,
        jurisdiction,
      }),
    });
    if (res.ok) {
      const { contractId } = await res.json();
      onClose();
      router.push(`/account/o/${organizationID}/contracts/${contractId}`);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-gray-500/20" />
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel className="w-screen max-w-2xl bg-white shadow-xl flex flex-col">
          {/* header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Heading>Nouveau contrat</Heading>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {org && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <img src={org.icon} className="h-6 w-6 rounded-full" />
                <span>{org.name}</span>
              </div>
            )}

            {/* Type */}
            <div>
              <label className="text-sm font-medium">Type de contrat</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1"
              >
                {contractTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === "consulting" ? "Prestation de service" : t}
                  </option>
                ))}
              </select>
            </div>

            {/* Devis */}
            <div>
              <label className="text-sm font-medium">Devis associé</label>
              <select
                value={estimateId}
                onChange={(e) => setEstimateId(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1"
              >
                <option value="">— Aucun —</option>
                {estimates.map((e) => (
                  <option key={e.estimateId} value={e.estimateId}>
                    {e.title} • {e.total}€
                  </option>
                ))}
              </select>
            </div>

            {/* Dates & durée */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date de début</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Durée initiale (mois)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(+e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </div>
            </div>

            {/* Renouvellement */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={renewable}
                  onChange={(e) => setRenewable(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Renouvelable</span>
              </label>
              {renewable && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Durée renouv. (mois)
                    </label>
                    <input
                      type="number"
                      value={renewDur}
                      onChange={(e) => setRenewDur(+e.target.value)}
                      className="mt-1 w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Préavis (jours)</label>
                    <input
                      type="number"
                      value={notice}
                      onChange={(e) => setNotice(+e.target.value)}
                      className="mt-1 w-full border rounded px-2 py-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Juridiction */}
            <div>
              <label className="text-sm font-medium">Juridiction</label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1"
              >
                {["Paris", "Lyon", "Marseille", "Bordeaux", "Lille"].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  ),
                )}
              </select>
            </div>
          </div>

          {/* footer */}
          <div className="p-4 border-t flex justify-end space-x-3">
            <Button onClick={onClose} className="bg-gray-100 text-gray-700">
              Annuler
            </Button>
            <Button onClick={create} className="bg-black text-white">
              Générer
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
