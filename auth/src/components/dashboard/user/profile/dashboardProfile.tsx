// components/dashboard/user/profile/dashboardProfile.tsx
"use client";

import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import ProfileForm from "./profilInformations/profileForm";
import { Button } from '@/src/components/landing-page/Button'

const sections = [
  { id: "personalInfo", name: "Personal Info" },
  { id: "paymentMethods", name: "Payment Methods" },
  { id: "userPreferences", name: "Preferences" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Profile: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("personalInfo");
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case "personalInfo":
        // return <ProfileForm />;
      case "paymentMethods":
        return (
          <div >
            <h3 className="text-lg font-medium mb-10 text-gray-900">
              Méthodes de Paiement
            </h3>
            <p className="text-sm text-gray-600">
              Managez vos méhthodes de paiement
            </p>
            <ul className="mt-4 space-y-4">
              <li className="flex items-center justify-between">
                <span className="text-gray-900">Visa **** 4242</span>
                <Button
                  variant="outline"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Supprimer
                </Button>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-900">
                  PayPal - johndoe@gmail.com
                </span>
                <Button
                  variant="outline"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Supprimer
                </Button>
              </li>
            </ul>
            <Button
              variant="outline"
              className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
            >
              + Add Payment Method
            </Button>
          </div>
        );
      case "userPreferences":
        return (
          <div>
            <h3 className="text-lg font-medium mb-10 text-gray-900">
              Vos Préférences
            </h3>
            <p className="text-sm text-gray-600">Customisez vos préférences </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-900">
                  autoriser les notifications{" "}
                </span>
                <Switch
                  checked={notificationEnabled}
                  onChange={setNotificationEnabled}
                  className={classNames(
                    notificationEnabled ? "bg-blue-600" : "bg-gray-200",
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  )}
                >
                  <span
                    className={classNames(
                      notificationEnabled ? "translate-x-6" : "translate-x-1",
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    )}
                  />
                </Switch>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-900">Dark Mode</span>
                <Switch
                  checked={darkMode}
                  onChange={setDarkMode}
                  className={classNames(
                    darkMode ? "bg-blue-600" : "bg-gray-200",
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  )}
                >
                  <span
                    className={classNames(
                      darkMode ? "translate-x-6" : "translate-x-1",
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    )}
                  />
                </Switch>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-lg p-6 sm:p-8 h-full w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Profile
        </h1>
        <p className="text-gray-600">Modifiez vos informations de profile</p>
        <div className="mt-8 flex space-x-6 border-b pb-4 overflow-x-auto">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant="outline"
              className={classNames(
                activeSection === section.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-blue-600",
                "text-base font-medium border-b-2 pb-2"
              )}
              onClick={() => setActiveSection(section.id)}
            >
              {section.name}
            </Button>
          ))}
        </div>
        <div className="mt-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Profile;
