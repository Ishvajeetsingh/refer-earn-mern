import React, { useState } from 'react';
import './App.css';
import Register from './components/Register';
import ApplyReferral from './components/ApplyReferral';

function App() {
  const [activeTab, setActiveTab] = useState('register');
  const [userData, setUserData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  const handleRegisterSuccess = (data) => {
    setUserData({
      userId: data.userId,
      name: data.name,
      email: data.email,
      referralCode: data.referralCode,
      coins: data.coins,
      hasAppliedReferral: false
    });
    showToast('Registration successful! Welcome aboard.', 'success');
    setTimeout(() => {
      setActiveTab('apply');
    }, 1500);
  };

  const handleReferralSuccess = (data) => {
    setUserData({
      ...userData,
      coins: data.coins,
      hasAppliedReferral: true
    });
    showToast(`Congratulations! You earned ${data.rewardEarned} coins`, 'success');
  };

  return (
    <div className="App">
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="container">
        <div className="header">
          <h1>Refer & Earn</h1>
          <p className="subtitle">Register and apply a referral code to earn coins</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
          <button 
            className={`tab ${activeTab === 'apply' ? 'active' : ''}`}
            onClick={() => setActiveTab('apply')}
            disabled={!userData}
          >
            Apply Referral
          </button>
        </div>

        <div className="form-content">
          {activeTab === 'register' && (
            <Register 
              onRegisterSuccess={handleRegisterSuccess}
              showToast={showToast}
            />
          )}

          {activeTab === 'apply' && userData && (
            <ApplyReferral 
              userData={userData} 
              onReferralSuccess={handleReferralSuccess}
              showToast={showToast}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;