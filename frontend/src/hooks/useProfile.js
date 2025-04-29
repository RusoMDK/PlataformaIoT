// src/hooks/useProfile.js
import { useState, useEffect } from 'react';
import { getProfile } from '../api/apiUsuarios'; // tu api de usuario

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  async function refreshProfile() {
    try {
      setLoadingProfile(true);
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error('❌ Error refrescando perfil:', error);
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    refreshProfile();
  }, []);

  return {
    profile,
    loadingProfile,
    refreshProfile, // 👈👈👈 ¡esto te faltaba exportarlo!
  };
}