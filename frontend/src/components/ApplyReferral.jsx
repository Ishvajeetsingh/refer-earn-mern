import React, { useState } from 'react';
import axios from 'axios';

const ApplyReferral = ({ userData, onReferralSuccess, showToast }) => {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userData.referralCode);
    setCopied(true);
    showToast('Referral code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/apply-referral`, {
        userId: userData.userId,
        referralCode: referralCode.trim()
      });
      
      if (response.data.success) {
        onReferralSuccess(response.data.data);
        setReferralCode('');
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Failed to apply referral code', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="user-info">
        <div className="welcome-text">Welcome, {userData.name}!</div>
        
        <div className="info-row">
          <span className="info-label">Your Referral Code</span>
          <div className="referral-code-container">
            <span className="referral-code">{userData.referralCode}</span>
            <button 
              type="button"
              className={`copy-button ${copied ? 'copied' : ''}`}
              onClick={handleCopyCode}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="info-row">
          <span className="info-label">Total Coins</span>
          <span className="coins-badge">{userData.coins}</span>
        </div>
      </div>

      {!userData.hasAppliedReferral ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Have a Referral Code?</label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral code"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Applying...' : 'Apply Referral Code'}
          </button>
        </form>
      ) : (
        <div className="success-banner">
          You have already applied a referral code!
        </div>
      )}
    </div>
  );
};

export default ApplyReferral;