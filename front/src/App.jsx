import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/utils/ProtectedRoute';
import Layout from './components/utils/Layout';
import Login from './components/authComponents/Login';
import ReporteriaMain from './components/Reporteria/ReporteriaMain';
import CatalogacionMain from './components/Catalogacion/CatalogacionMain';
import ProgramacionMain from './components/Programacion/ProgramacionMain';
import PerfilMain from './components/Perfil/PerfilMain';
import { AuthProvider } from './components/authComponents/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/Login' element={<Login/>}/>
          <Route path='/' element={<ProtectedRoute><Layout/></ProtectedRoute>}>
          
          <Route index element={<Navigate to="/catalogo" replace />} /> 
          <Route path='catalogo' element={<ProtectedRoute allowedGroups={['AdLogger','OnAirLogger']}><CatalogacionMain/></ProtectedRoute>}/> 
          <Route path='programacion' element={<ProtectedRoute allowedGroups={['AdLogger','OnAirLogger']}><ProgramacionMain/></ProtectedRoute>}/>   
          <Route path='reporteria' element={<ProtectedRoute allowedGroups={['Viewer']}><ReporteriaMain/></ProtectedRoute>}/>
          <Route path='perfil' element={<ProtectedRoute><PerfilMain/></ProtectedRoute>}/>  

          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;
