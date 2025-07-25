// components/common/SwitchTable.tsx
import React from 'react';
import { Switch } from '@headlessui/react';

interface SwitchItem {
  id: string;
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

interface SwitchTableProps {
  items: SwitchItem[];
}

const SwitchTable: React.FC<SwitchTableProps> = ({ items }) => {
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="mt-4 space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between">
          <span className="text-gray-900">{item.label}</span>
          <Switch
            checked={item.enabled}
            onChange={item.onChange}
            className={classNames(
              item.enabled ? 'bg-blue-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors'
            )}
          >
            <span
              className={classNames(
                item.enabled ? 'translate-x-6' : 'translate-x-1',
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform'
              )}
            />
          </Switch>
        </div>
      ))}
    </div>
  );
};

export default SwitchTable;