import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/utils/ProtectedRoute';
import Layout from './components/utils/Layout';
import Login from './components/authComponents/Login';
import ReporteriaMain from './components/Reporteria/ReporteriaMain';
import CatalogacionMain from './components/Catalogacion/CatalogacionMain';
import ProgramacionMain from './components/Programacion/ProgramacionMain';
import ViewReport from './components/Reporteria/ViewReport';
import CreateCatModal from './components/Catalogacion/Modals/CreateCatModal';
import { AuthProvider } from './components/authComponents/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/Login' element={<Login/>}/>
          
          {/* Rutas Protegidas (con sidebar) 
              Usamos una ruta "padre" que renderiza el Layout.
              ProtectedRoute envuelve el Layout UNA SOLA VEZ.
          */}
          <Route 
            path='/' 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/catalogo" replace />} /> 
            <Route path='catalogo' element={<CatalogacionMain/>}/> 
            <Route path='programacion' element={<ProgramacionMain/>}/>   
            <Route path='reporteria' element={<ReporteriaMain/>}/>  
            <Route path='viewReport' element={<ViewReport/>}/>  

            {/* Ruta para tests */}
            <Route path='test' element={<CreateCatModal isOpen={true}/>}/>  

          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;
