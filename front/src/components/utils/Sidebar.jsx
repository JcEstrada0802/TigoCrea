// src/components/Sidebar.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { NavLink, useNavigate} from 'react-router-dom';
import { FaRightFromBracket} from 'react-icons/fa6';
import axios from 'axios';
import Logo from '../../assets/Logo.png';
import { useAuth } from '../authComponents/UseAuth';

const SidebarContext = createContext();

const CalendarIcon = (
  <svg
    className="icon size-6 stroke-current group-focus:text-white"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path d="M14,10V22H4a2,2,0,0,1-2-2V10Z" className="fill-current" />
    <path d="M22,10V20a2,2,0,0,1-2,2H16V10Z" className="fill-current" />
    <path d="M22,4V8H2V4A2,2,0,0,1,4,2H20A2,2,0,0,1,22,4Z" className="fill-current" />
  </svg>
)

const ProfileIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon size-6 stroke-current group-focus:text-white"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
      10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3
      1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1c-1.29 1.94-3.5 3.22-6 3.22z"
    />
  </svg>
)

const CatalogIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon size-6 stroke-current group-focus:text-white"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM4 20V4h7v16H4zm16 0h-7V4h7v16zM9 9H6v2h3V9zm0 4H6v2h3v-2zm0 4H6v2h3v-2z" />
  </svg>
)

const ReportingIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon size-6 stroke-current group-focus:text-white"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M5 9.2h3V20H5V9.2zm10 3.8h3V20h-3v-7zm-5-6h3V20h-3V6zM22 20H2v2h20v-2z" />
  </svg>
)


function SidebarItem({ icon, text, to, alert }) {
    const { isExpanded } = useContext(SidebarContext);
    
    return (
        <li className="relative my-1">
            <NavLink
                to={to}
                className={({ isActive }) => `
                flex items-center py-2 px-3 font-medium rounded-md cursor-pointer
                transition-colors group text-black
                ${isActive 
                    ? "bg-blue-800 !text-white" 
                    : "hover: !text-black hover:bg-sky-300"
                }
                `}
            >
                <div className="flex-shrink-0">
                {icon}
                </div>
                <span className={`overflow-hidden transition-all whitespace-nowrap font-semibold ${isExpanded ? "w-52 ml-3" : "w-0"}`}>
                {text}
                </span>
            </NavLink>
        </li>
    );
}

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [user, setUser] = useState({});
    const { logout } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const handleToggle = () => setIsExpanded(prev => !prev);
    
    const handleLogout = async () => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              console.error('No se encontró el token de autenticación.');
              navigate('/login');
              return;
          }
          await axios.post(
              apiUrl + '/reporteria/logout/', 
              {},
              {
                  headers: {
                      Authorization: `Token ${token}`,
                  },
                  withCredentials: true,
              }
          );
          logout();
          navigate('/login');
      } catch (error) {
          console.error('Error al cerrar sesión:', error);
          localStorage.removeItem('token');
          navigate('/login');
      }
    };
    
    useEffect(()=>{
      const fetchUser = async() =>{
        const token = localStorage.getItem('token');
        const user = await axios.post(`${apiUrl}/reporteria/getUserContext/`,{},
            {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
        setUser(user.data);
      }
      fetchUser();
    },[])

    return (
        <aside className="h-screen sticky top-0">
            <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                <img
                    src={Logo}
                    className={`h-auto p-1 object-contain transition-all duration-300 
                                ${isExpanded ? "w-70" : "w-22"}`}
                    alt="Logo"
                    />
                <div className="p-3 pb-2 flex justify-end items-center">
                    <button onClick={handleToggle} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
                        {isExpanded ? <GoChevronLeft /> : <GoChevronRight />}
                    </button>
                </div>

                <SidebarContext.Provider value={{ isExpanded }}>
                    <ul className="flex-1 px-3">
                        <SidebarItem icon={CatalogIcon} text="Catálogo" to="/catalogo" />
                        <SidebarItem icon={CalendarIcon} text="Programación" to="/programacion" />
                        <SidebarItem icon={ReportingIcon} text="Reportería" to="/reporteria" />
                        <hr className="my-3" />
                        <SidebarItem icon={ProfileIcon} text="Profile" to="/perfil" />
                    </ul>
                </SidebarContext.Provider>
                
                <div className="border-t flex p-3">
                    <img 
                        src={`https://ui-avatars.com/api/?background=001EB4&color=44C8F5&bold=true&name=${user.first_name}+${user.last_name}`}
                        className="w-10 h-10 rounded-md"
                        alt="Avatar"
                    />
                    <div className={`flex justify-between items-center overflow-hidden transition-all ${isExpanded ? "w-52 ml-3" : "w-0"}`}>
                        <div className="leading-4 whitespace-nowrap">
                            <h4 className="font-semibold">{user.first_name} {user.last_name}</h4>
                            <span className="text-xs text-gray-600">{user.email}</span>
                        </div>
                        <FaRightFromBracket 
                            size={20} 
                            className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors" 
                            onClick={handleLogout} 
                        />
                    </div>
                </div>
            </nav>
        </aside>
    );
}