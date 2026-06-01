import { useState } from 'react';
import NavBar from './components/NavBar';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  function renderPage() {
    switch (currentPage) {
      case 'products':
        return <ProductsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'orders':
        return <OrdersPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  }

  return (
    <>
      <NavBar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>{renderPage()}</main>
    </>
  );
}
