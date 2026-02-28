import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RoleSelect from './pages/RoleSelect';
import TeacherView from './pages/TeacherView';
import StudentView from './pages/StudentView';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1b4b',
            color: '#e9d5ff',
            border: '1px solid #7c3aed',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/teacher" element={<TeacherView />} />
        <Route path="/student" element={<StudentView />} />
      </Routes>
    </BrowserRouter>
  );
}
