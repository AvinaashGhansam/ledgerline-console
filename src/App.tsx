import "./App.css";
import Panel from "./components/Panel/Panel.tsx";
import AccountsTable from "./components/AccountsTable/AccountsTable.tsx";
import { accounts } from "./mocks/fixtures.ts";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Ledger Console</h1>
      </header>
      <main className="app-grid">
        <Panel title="Account">
          <AccountsTable accounts={accounts} />
        </Panel>
        <Panel title="Entry">
          <p>Entry table goes here</p>
        </Panel>
      </main>
    </div>
  );
}

export default App;
