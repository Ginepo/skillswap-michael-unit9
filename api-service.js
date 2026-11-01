const API_BASE_URL = 'http://localhost:3000/api';

async function fetchSkills() {
  const response = await fetch(`${API_BASE_URL}/skills`);

  if (!response.ok) {
    throw new Error('Could not load skills. Please try again.');
  }

  return response.json();
}

async function createSkill(skillData) {
  const response = await fetch(`${API_BASE_URL}/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(skillData)
  });

  if (!response.ok) {
    throw new Error('Could not save the skill. Please try again.');
  }

  return response.json();
}

window.apiService = { fetchSkills, createSkill };