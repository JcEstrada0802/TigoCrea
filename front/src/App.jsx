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
          <Route path='/' element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          
          <Route index element={<Navigate to="/catalogo" replace />} /> 
          <Route path='catalogo' element={<ProtectedRoute requiredGroup={['AdLogger']}><CatalogacionMain/></ProtectedRoute>}/> 
          <Route path='programacion' element={<ProtectedRoute requiredGroup={['AdLogger']}><ProgramacionMain/></ProtectedRoute>}/>   
          <Route path='reporteria' element={<ReporteriaMain/>}/>  
          <Route path='viewReport' element={<ViewReport/>}/>  

          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;
