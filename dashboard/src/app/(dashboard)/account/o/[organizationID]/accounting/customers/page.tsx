import { smpClient, initializeSMPClient } from '@/smpClient';
import AccountingTabs from '@/src/components/dashboard/organization/accounting/accountingTabs';
import { Metadata } from 'next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/catalyst/components/table'
import { Heading, Subheading } from '@/src/components/catalyst/components/heading'
import { Select } from '@/src/components/catalyst/components/select'
import { Stat } from '@/src/app/stat'

export const metadata: Metadata = {
  title: 'Comptabilité - Clients',
  description: 'Gérez la comptabilité de vos clients',
};

export default async function CustomersAccountingPage({ params }: { params: { organizationID: string } }) {
  try {
    await initializeSMPClient();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Heading>Comptabilité</Heading>
        </div>
        <div className="mt-8  flex items-end justify-between">
          <Subheading>Aperçu</Subheading>
          <div>
            <Select name="period">
              <option value="last_week">Semaine dernière</option>
              <option value="last_two">Deux dernières semaines</option>
              <option value="last_month">Mois dernier</option>
              <option value="last_quarter">Trimestre dernier</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 mb-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          <Stat title="Chiffre d'affaires total" value="2,6M€" change="+4,5%" />
          <Stat title="Valeur moyenne des commandes" value="455€" change="-0,5%" />
          <Stat title="Tickets vendus" value="5 888" change="+4,5%" />
          <Stat title="Pages vues" value="823 067" change="+21,2%" />
        </div>

        <AccountingTabs organizationID={params.organizationID} view="customers" />
      </div>
    );
  } catch (error) {
    console.error('Erreur dans la page:', error);
    return <div>Erreur lors du chargement des données comptables</div>;
  }
}
