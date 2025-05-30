import { UserProvider } from './contexts/UserContext';
import { Layout } from './components/Layout';
import { ComplaintsList } from './components/ComplaintsList';
import { CompensationsList } from './components/CompensationsList';

function App() {
  return (
    <UserProvider>
      <Layout>
        <div className="grid grid-cols-1 gap-8">
          <ComplaintsList />
          <CompensationsList />
        </div>
      </Layout>
    </UserProvider>
  );
}

export default App;
