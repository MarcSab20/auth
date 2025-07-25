import React, { useEffect, useState } from "react";
import SMPServiceLargeZone from "./zone";
import ResponsiveCarousel from "@/src/components/responsiveCaroussel";
import SMPAssetCard, { SMPAsset } from "@/src/components/asset/assetCard";
import {Divider} from "@/src/components/catalyst/components/divider";

interface SMPDetailsProps {
  serviceID: string;
  locationID?: string;
}

const SMPDetails: React.FC<SMPDetailsProps> = ({ serviceID, locationID }) => {
  const [assets, setAssets] = useState<SMPAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ country?: string; city?: string } | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/assets/services/${serviceID}`);
        const data = await res.json();
        console.log('API assets response:', data);
        setAssets(Array.isArray(data)
          ? (data[0]?.asset ? data.map(sa => sa.asset) : data)
          : []);
      } catch (e) {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };
    if (serviceID) fetchAssets();
  }, [serviceID]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationID) return;
      try {
        const res = await fetch("/api/location/getById", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locationID }),
        });
        const data = await res.json();

        console.log(data);
        setLocation({ country: data.country, city: data.city });
      } catch (e) {
        setLocation(null);
      }
    };
    fetchLocation();
  }, [locationID]);

  return (
    <div className="details-container">
      {/* Map de localisation */}
      <SMPServiceLargeZone country={location?.country} city={location?.city} />

      <Divider />
      {/* Assets liés au service */}
      {loading ? (
        <div className="text-gray-500">Chargement des assets...</div>
      ) : assets.length === 0 ? (
        <div className="text-gray-500">Aucun asset lié à ce service.</div>
      ) : (
        <ResponsiveCarousel noPadding>
          {assets.map((asset) => (
            <SMPAssetCard
              key={asset.assetID}
              asset={asset}
              quantity={0}
              onIncrease={() => {}}
              onDecrease={() => {}}
              showQuantitySelector={false}
            />
          ))}
        </ResponsiveCarousel>
      )}
    </div>
  );
};

export default SMPDetails;
