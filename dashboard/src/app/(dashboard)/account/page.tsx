import { Stat } from '@/src/app/stat'
import { Avatar } from '@/src/components/catalyst/components/avatar'
import { Heading, Subheading } from '@/src/components/catalyst/components/heading'
import { Select } from '@/src/components/catalyst/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/catalyst/components/table'
import { getRecentOrders } from '@/src/components/catalyst/data'
import  Balance  from '@/src/components/dashboard/user/balance/balance'

export default async function Home() {
  let orders = await getRecentOrders()

  return (
    <>

      <Heading>Dashboard</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
        <div>
          <Select name="period">
            <option value="last_week">Last week</option>
            <option value="last_two">Last two weeks</option>
            <option value="last_month">Last month</option>
            <option value="last_quarter">Last quarter</option>
          </Select>
        </div>
      </div>
      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total des revenus " value="0" change="+4.5%" />
        <Stat title="Valeur moyenne des commandes" value="0" change="-0.5%" />
        <Stat title="Vues des services " value="0" change="+21.2%" />
      </div>
      
    </>
  )
}
