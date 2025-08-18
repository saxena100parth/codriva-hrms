import api from './api';

export const onboardingService = {
  async invite(payload) {
    const res = await api.post('/auth/invite', payload);
    return res.data;
  },
  async submit(details) {
    const res = await api.post('/auth/onboarding', details);
    return res.data;
  },
  async listSubmissions() {
    const res = await api.get('/auth/onboarding/submissions');
    return res.data;
  },
  async approve(userId, officialEmail, employee) {
    const res = await api.post(`/auth/onboarding/${userId}/approve`, { officialEmail, employee });
    return res.data;
  },
};


