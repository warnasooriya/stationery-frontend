import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Inventory from './pages/Inventory.jsx';
import BinCard from './pages/BinCard.jsx';
import LogPurchase from './pages/LogPurchase.jsx';
import IssueItem from './pages/IssueItem.jsx';
import Items from './pages/Items.jsx';
import Employees from './pages/Employees.jsx';
import PurchasesLog from './pages/logs/PurchasesLog.jsx';
import IssuancesLog from './pages/logs/IssuancesLog.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/bin-card/:itemId" element={<BinCard />} />
        <Route path="/purchase" element={<LogPurchase />} />
        <Route path="/issue" element={<IssueItem />} />
        <Route path="/items" element={<Items />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/logs/purchases" element={<PurchasesLog />} />
        <Route path="/logs/issuances" element={<IssuancesLog />} />
      </Routes>
    </Layout>
  );
}
