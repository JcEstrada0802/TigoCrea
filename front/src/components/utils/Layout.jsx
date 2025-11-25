import Sidebar from './Sidebar'; 
import { Outlet } from 'react-router-dom'; //componente para renderizar hijos

export default function Layout() {
  return (
    <div className="flex h-screen  w-screen bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}