import { useState } from 'react'
import Hero from './components/Hero'
import WelcomeDialog from './components/WelcomeDialog';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleCloseDialog = () => {
    setShowWelcome(false);
  };

  return (
    <>
      {showWelcome && <WelcomeDialog onClose={handleCloseDialog} />}
      <Hero />
    </>
  )
}

export default App